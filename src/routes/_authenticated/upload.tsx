import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, lazy, useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, RefreshCw, Search, BellRing, Map as MapIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyzeNewspaper } from "@/lib/newspapers.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/app/RiskBadge";

const MapView = lazy(() => import("@/components/app/MapView").then((m) => ({ default: m.MapView })));

const DEFAULT_KEYWORDS = "land, property, survey number, encroachment, land grabbing, illegal possession, boundary dispute, court case, property fraud";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({
    meta: [
      { title: "Upload newspapers — BhoomiWatch" },
      {
        name: "description",
        content:
          "Upload newspaper PDFs, scanned pages and images. OCR and AI automatically find land and property dispute articles.",
      },
      { property: "og:title", content: "Upload newspapers for land dispute scanning" },
      { property: "og:description", content: "OCR + AI reads full newspapers and extracts land dispute articles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const queryClient = useQueryClient();
  const analyze = useServerFn(analyzeNewspaper);
  const [files, setFiles] = useState<File[]>([]);
  const [newspaperName, setNewspaperName] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [language, setLanguage] = useState("");
  const [keywords, setKeywords] = useState(DEFAULT_KEYWORDS);
  const [busy, setBusy] = useState(false);
  const [lastPaperIds, setLastPaperIds] = useState<string[]>([]);
  const [alertMessages, setAlertMessages] = useState<
    { articleId: string; title: string; propertyLabel: string; reason: string; riskLevel: string; channels: string[] }[]
  >([]);

  const keywordList = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const { data: papers } = useQuery({
    queryKey: ["newspapers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newspapers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    refetchInterval: 8000,
  });

  const { data: foundArticles } = useQuery({
    queryKey: ["land_articles", "scan", lastPaperIds],
    enabled: lastPaperIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("land_articles")
        .select("*")
        .in("newspaper_id", lastPaperIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: properties } = useQuery({
    queryKey: ["monitored_properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("monitored_properties").select("*");
      if (error) throw error;
      return data;
    },
  });

  const matchedArticles = (foundArticles ?? []).map((a) => {
    const haystack = [a.title, a.summary, a.original_text, a.survey_number, a.location, a.village, a.district, a.dispute_type]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return { article: a, hits: keywordList.filter((k) => haystack.includes(k.toLowerCase())) };
  });

  const mapArticles = (foundArticles ?? []).filter((a) => a.latitude != null && a.longitude != null);
  const mapProperties = (properties ?? []).filter((p) => p.latitude != null && p.longitude != null);

  const runAnalysis = async (newspaperId: string) => {
    const result = await analyze({ data: { newspaperId, keywords: keywordList } });
    setLastPaperIds((prev) => (prev.includes(newspaperId) ? prev : [...prev, newspaperId]));
    setAlertMessages((prev) => [...(result.alertMessages ?? []), ...prev]);
    queryClient.invalidateQueries();
    if (result.alerts > 0) {
      toast.warning(`${result.alerts} alert(s) raised for your monitored properties`);
    }
    return result;
  };

  const upload = async () => {
    if (!files.length) return;
    setBusy(true);
    setLastPaperIds([]);
    setAlertMessages([]);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setBusy(false);
      return;
    }

    for (const file of files) {
      try {
        const path = `${userId}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: uploadError } = await supabase.storage.from("newspapers").upload(path, file);
        if (uploadError) throw uploadError;

        const { data: inserted, error: insertError } = await supabase
          .from("newspapers")
          .insert({
            user_id: userId,
            file_name: file.name,
            storage_path: path,
            mime_type: file.type || "application/octet-stream",
            newspaper_name: newspaperName || null,
            publication_date: publicationDate || null,
            language: language || null,
            status: "processing",
          })
          .select()
          .single();
        if (insertError) throw insertError;

        queryClient.invalidateQueries({ queryKey: ["newspapers"] });
        const result = await runAnalysis(inserted.id);
        toast.success(`${file.name}: ${result.articles} land article(s) detected`);
      } catch (error) {
        toast.error(`${file.name}: ${error instanceof Error ? error.message : "Upload failed"}`);
      }
    }

    setFiles([]);
    setBusy(false);
    queryClient.invalidateQueries();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl">Upload newspapers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete newspaper PDFs, scanned pages or JPG/PNG images — multiple files and regional
          languages supported. OCR and AI read every page for you.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New upload</CardTitle>
          <CardDescription>
            Optional details help the AI label extracted articles more accurately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/50 px-6 py-10 text-center transition-colors hover:border-primary/50">
            <UploadCloud className="size-8 text-primary" />
            <span className="text-sm font-medium">Choose newspapers</span>
            <span className="text-xs text-muted-foreground">PDF, JPG, PNG · multiple files allowed</span>
            <input
              type="file"
              className="hidden"
              multiple
              accept="application/pdf,image/*"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>

          {files.length > 0 && (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {files.map((file) => (
                <li key={file.name}>• {file.name} ({Math.round(file.size / 1024)} KB)</li>
              ))}
            </ul>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="paper">Newspaper name</Label>
              <Input id="paper" value={newspaperName} onChange={(e) => setNewspaperName(e.target.value)} placeholder="e.g. Prajavani" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Publication date</Label>
              <Input id="date" type="date" value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lang">Language</Label>
              <Input id="lang" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. Kannada" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords" className="flex items-center gap-2">
              <Search className="size-3.5" /> Search keywords
            </Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="land, survey number, encroachment…"
            />
            <p className="text-xs text-muted-foreground">
              Comma separated. The newspaper is searched for these words (including regional-language equivalents) while
              it is being read.
            </p>
          </div>

          <Button onClick={upload} disabled={busy || !files.length}>
            {busy ? (<><Loader2 className="size-4 animate-spin" /> Reading newspapers…</>) : "Upload & scan"}
          </Button>
        </CardContent>
      </Card>

      {alertMessages.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BellRing className="size-4 text-destructive" /> Alerts raised ({alertMessages.length})
            </CardTitle>
            <CardDescription>Matches against your monitored properties in this scan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alertMessages.map((alert, i) => (
              <div key={`${alert.articleId}-${i}`} className="rounded-lg border px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge risk={alert.riskLevel} />
                  <span className="text-sm font-medium">{alert.propertyLabel}</span>
                </div>
                <p className="mt-1 text-sm">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.reason}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {alert.channels.map((c) => (
                    <Badge key={c} variant="secondary" className="text-[10px] uppercase">
                      {c}
                    </Badge>
                  ))}
                  <Link
                    to="/articles/$articleId"
                    params={{ articleId: alert.articleId }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Open article
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {matchedArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="size-4 text-primary" /> Related documents found ({matchedArticles.length})
            </CardTitle>
            <CardDescription>Land related articles detected in the newspapers you just uploaded.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {matchedArticles.map(({ article, hits }) => (
              <Link
                key={article.id}
                to="/articles/$articleId"
                params={{ articleId: article.id }}
                className="block rounded-lg border px-4 py-3 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-medium">{article.title}</p>
                  <RiskBadge risk={article.risk_level} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{article.summary}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {article.survey_number && <Badge variant="outline">Survey {article.survey_number}</Badge>}
                  {[article.village, article.taluk, article.district].filter(Boolean).join(" · ") && (
                    <span>{[article.village, article.taluk, article.district].filter(Boolean).join(" · ")}</span>
                  )}
                  {hits.map((h) => (
                    <Badge key={h} variant="secondary" className="text-[10px]">
                      {h}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {lastPaperIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapIcon className="size-4 text-primary" /> Locations on map
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mapArticles.length === 0 && mapProperties.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No coordinates were found for these articles yet. Add coordinates to your properties to see them here.
              </p>
            ) : (
              <Suspense
                fallback={
                  <div className="flex h-[400px] items-center justify-center rounded-xl border bg-muted">
                    <p className="text-sm text-muted-foreground">Loading map…</p>
                  </div>
                }
              >
                <MapView articles={mapArticles} properties={mapProperties} />
              </Suspense>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!papers?.length && <p className="text-sm text-muted-foreground">No newspapers uploaded yet.</p>}
          {papers?.map((paper) => (
            <div key={paper.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{paper.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {[paper.newspaper_name, paper.publication_date, paper.language].filter(Boolean).join(" · ") || "Details from AI"}
                </p>
                {paper.error_message && <p className="text-xs text-destructive">{paper.error_message}</p>}
              </div>
              <div className="flex items-center gap-3 text-xs">
                {paper.status === "completed" && (
                  <span className="flex items-center gap-1 text-primary">
                    <CheckCircle2 className="size-4" /> {paper.articles_detected} land article(s)
                  </span>
                )}
                {paper.status === "processing" && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> processing
                  </span>
                )}
                {paper.status === "failed" && (
                  <>
                    <span className="flex items-center gap-1 text-destructive"><AlertCircle className="size-4" /> failed</span>
                    <Button size="sm" variant="outline" onClick={() => runAnalysis(paper.id).catch((e) => toast.error(e.message))}>
                      <RefreshCw className="size-3" /> Retry
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
