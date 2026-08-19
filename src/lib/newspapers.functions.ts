import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeName, normalizeSurvey } from "./land";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

const extractionTool = {
  type: "function",
  function: {
    name: "report_land_articles",
    description:
      "Report every land/property related article found in the newspaper page(s).",
    parameters: {
      type: "object",
      properties: {
        newspaper_name: { type: "string" },
        publication_date: { type: "string", description: "YYYY-MM-DD if visible" },
        language: { type: "string" },
        page_count: { type: "number" },
        full_text: {
          type: "string",
          description: "Full OCR text of the document (may be truncated to 20000 chars)",
        },
        articles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              original_text: { type: "string" },
              summary: { type: "string" },
              source_page: { type: "string" },
              language: { type: "string" },
              persons: { type: "array", items: { type: "string" } },
              owner_names: { type: "array", items: { type: "string" } },
              organizations: { type: "array", items: { type: "string" } },
              survey_number: { type: "string" },
              location: { type: "string" },
              village: { type: "string" },
              taluk: { type: "string" },
              district: { type: "string" },
              state: { type: "string" },
              area_extent: { type: "string" },
              dispute_type: { type: "string" },
              court_info: { type: "string" },
              important_dates: { type: "array", items: { type: "string" } },
              risk_level: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
              confidence: { type: "number" },
            },
            required: ["title", "original_text", "dispute_type", "risk_level"],
          },
        },
      },
      required: ["articles"],
    },
  },
} as const;

const SYSTEM_PROMPT = `You are an OCR + information extraction engine for an automated land and property dispute monitoring system.
You receive scanned newspaper pages or newspaper PDFs, possibly in Indian regional languages (Kannada, Tamil, Telugu, Hindi, Malayalam, Marathi, etc.).

Tasks:
1. Read (OCR) the whole document, including regional-language text.
2. Identify ONLY the articles related to land, property, ownership disputes, encroachment, illegal possession, land grabbing, boundary disputes, survey-number disputes, property fraud, fake land documents, government land disputes, court cases involving property, acquisition disputes, inheritance/property disputes, construction disputes and real-estate fraud. Ignore every unrelated article.
3. For each relevant article, extract the structured fields. Keep the original article text verbatim (transliterate nothing; keep the original language) and also give a short English summary.
4. Never assert that a person legally owns or possesses land. Only report what the article states.
5. Risk level: HIGH for active disputes, criminal allegations, court proceedings, land grabbing or fraud; MEDIUM for notices, acquisition or boundary issues; LOW for informational mentions.
6. Leave a field out when the newspaper does not state it. Never invent survey numbers, names or places.
Always answer by calling the report_land_articles tool.`;

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

type ExtractedArticle = any;

function str(value: unknown) {
  const s = typeof value === "string" ? value.trim() : "";
  return s.length ? s : null;
}
function arr(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v) => typeof v === "string" && v.trim()) : [];
}

export const analyzeNewspaper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ newspaperId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: paper, error: paperError } = await supabase
      .from("newspapers")
      .select("*")
      .eq("id", data.newspaperId)
      .single();
    if (paperError || !paper) throw new Error("Newspaper not found");

    await supabase.from("newspapers").update({ status: "processing", error_message: null }).eq("id", paper.id);

    try {
      const file = await supabase.storage.from("newspapers").download(paper.storage_path);
      if (file.error || !file.data) throw new Error("Could not read the uploaded file");

      const bytes = new Uint8Array(await file.data.arrayBuffer());
      const base64 = toBase64(bytes);
      const mime = paper.mime_type || "application/octet-stream";
      const isPdf = mime.includes("pdf");

      const contentBlock = isPdf
        ? {
            type: "file",
            file: { filename: paper.file_name, file_data: `data:${mime};base64,${base64}` },
          }
        : { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } };

      const apiKey = process.env["LOVABLE_API_KEY"];
      if (!apiKey) throw new Error("AI is not configured for this project");

      const response = await fetch(GATEWAY, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Newspaper file: ${paper.file_name}. Known newspaper name: ${paper.newspaper_name ?? "unknown"}. Known publication date: ${paper.publication_date ?? "unknown"}. Extract all land/property related articles.`,
                },
                contentBlock,
              ],
            },
          ],
          tools: [extractionTool],
          tool_choice: { type: "function", function: { name: "report_land_articles" } },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        if (response.status === 429) throw new Error("AI rate limit reached. Please retry in a moment.");
        if (response.status === 402) throw new Error("AI credits exhausted for this workspace.");
        throw new Error(`AI analysis failed (${response.status}): ${body.slice(0, 300)}`);
      }

      const payload = (await response.json()) as any;
      const call = payload?.choices?.[0]?.message?.tool_calls?.[0];
      const parsed = call?.function?.arguments ? JSON.parse(call.function.arguments) : { articles: [] };
      const articles: ExtractedArticle[] = Array.isArray(parsed.articles) ? parsed.articles : [];

      const publicationDate = str(parsed.publication_date) ?? paper.publication_date;
      const newspaperName = paper.newspaper_name ?? str(parsed.newspaper_name);
      const language = paper.language ?? str(parsed.language);

      const rows = articles.map((a) => ({
        user_id: userId,
        newspaper_id: paper.id,
        title: str(a.title) ?? "Untitled article",
        original_text: str(a.original_text),
        summary: str(a.summary),
        newspaper_name: newspaperName,
        publication_date: publicationDate,
        language: str(a.language) ?? language,
        source_page: str(a.source_page),
        persons: arr(a.persons),
        owner_names: arr(a.owner_names),
        organizations: arr(a.organizations),
        survey_number: str(a.survey_number),
        location: str(a.location),
        village: str(a.village),
        taluk: str(a.taluk),
        district: str(a.district),
        state: str(a.state),
        area_extent: str(a.area_extent),
        dispute_type: str(a.dispute_type),
        court_info: str(a.court_info),
        important_dates: arr(a.important_dates),
        risk_level: (str(a.risk_level) ?? "LOW").toUpperCase(),
        confidence: typeof a.confidence === "number" ? a.confidence : null,
        verification_status: "AI_DETECTED",
      }));

      let inserted: any[] = [];
      if (rows.length) {
        const { data: insertedRows, error: insertError } = await supabase
          .from("land_articles")
          .insert(rows)
          .select();
        if (insertError) throw new Error(insertError.message);
        inserted = insertedRows ?? [];
      }

      await supabase
        .from("newspapers")
        .update({
          status: "completed",
          articles_detected: inserted.length,
          ocr_text: str(parsed.full_text),
          newspaper_name: newspaperName,
          publication_date: publicationDate,
          language,
          page_count: typeof parsed.page_count === "number" ? parsed.page_count : null,
        })
        .eq("id", paper.id);

      const alerts = await matchAndAlert(supabase, userId, inserted);

      return { articles: inserted.length, alerts };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Processing failed";
      await supabase
        .from("newspapers")
        .update({ status: "failed", error_message: message })
        .eq("id", data.newspaperId);
      throw new Error(message);
    }
  });

async function matchAndAlert(supabase: any, userId: string, articles: any[]) {
  if (!articles.length) return 0;
  const { data: properties } = await supabase
    .from("monitored_properties")
    .select("*")
    .eq("user_id", userId);
  if (!properties?.length) return 0;

  const alertRows: any[] = [];
  for (const property of properties) {
    for (const article of articles) {
      const reasons: string[] = [];
      let score = 0;

      const pSurvey = normalizeSurvey(property.survey_number);
      const aSurvey = normalizeSurvey(article.survey_number);
      if (pSurvey && aSurvey && (pSurvey === aSurvey || aSurvey.startsWith(pSurvey + "/"))) {
        score += 0.6;
        reasons.push(`Survey number ${property.survey_number} mentioned`);
      }
      if (
        normalizeName(property.village) &&
        normalizeName(property.village) === normalizeName(article.village)
      ) {
        score += 0.2;
        reasons.push(`Village ${property.village} mentioned`);
      }
      if (
        normalizeName(property.taluk) &&
        normalizeName(property.taluk) === normalizeName(article.taluk)
      ) {
        score += 0.1;
        reasons.push(`Taluk ${property.taluk} mentioned`);
      }
      if (
        normalizeName(property.district) &&
        normalizeName(property.district) === normalizeName(article.district)
      ) {
        score += 0.1;
        reasons.push(`District ${property.district} mentioned`);
      }
      const owner = normalizeName(property.owner_name);
      if (
        owner &&
        [...(article.owner_names ?? []), ...(article.persons ?? [])].some(
          (n: string) => normalizeName(n).includes(owner) || owner.includes(normalizeName(n)),
        )
      ) {
        score += 0.25;
        reasons.push(`Owner name ${property.owner_name} mentioned`);
      }

      if (score >= 0.5) {
        const channels = [
          "web",
          ...(property.notify_email ? ["email"] : []),
          ...(property.notify_sms ? ["sms"] : []),
          ...(property.notify_whatsapp ? ["whatsapp"] : []),
        ];
        alertRows.push({
          user_id: userId,
          property_id: property.id,
          article_id: article.id,
          match_reason: reasons.join(" · "),
          match_score: Math.min(score, 1),
          risk_level: article.risk_level ?? "MEDIUM",
          channels,
        });
      }
    }
  }

  if (!alertRows.length) return 0;
  await supabase.from("alerts").insert(alertRows);
  return alertRows.length;
}

export const getArticleFileUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ newspaperId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: paper } = await context.supabase
      .from("newspapers")
      .select("storage_path, mime_type, file_name")
      .eq("id", data.newspaperId)
      .single();
    if (!paper) return { url: null, mimeType: null };
    const { data: signed } = await context.supabase.storage
      .from("newspapers")
      .createSignedUrl(paper.storage_path, 3600);
    return { url: signed?.signedUrl ?? null, mimeType: paper.mime_type, fileName: paper.file_name };
  });