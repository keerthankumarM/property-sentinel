import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyzeNewspaper } from "@/lib/newspapers.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [busy, setBusy] = useState(false);

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

  const runAnalysis = async (newspaperId: string) => {
    const result = await analyze({ data: { newspaperId } });
    queryClient.invalidateQueries();
    if (result.alerts > 0) {
      toast.warning(`${result.alerts} alert(s) raised for your monitored properties`);
    }
    return result;
  };

  const upload = async () => {
    if (!files.length) return;
    setBusy(true);
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

          <Button onClick={upload} disabled={busy || !files.length}>
            {busy ? (<><Loader2 className="size-4 animate-spin" /> Reading newspapers…</>) : "Upload & scan"}
          </Button>
        </CardContent>
      </Card>

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
