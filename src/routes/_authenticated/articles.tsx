import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Filter, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RiskBadge, VerificationBadge } from "@/components/app/RiskBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISPUTE_TYPES } from "@/lib/land";

export const Route = createFileRoute("/_authenticated/articles")({
  head: () => ({
    meta: [
      { title: "Land articles — BhoomiWatch" },
      { name: "description", content: "Browse every land, property and ownership dispute article extracted from uploaded newspapers." },
      { property: "og:title", content: "Land articles — BhoomiWatch" },
      { property: "og:description", content: "Browse detected land and property dispute articles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState<string>("ALL");
  const [disputeType, setDisputeType] = useState<string>("ALL");

  const { data: articles } = useQuery({
    queryKey: ["land_articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("land_articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = (articles ?? []).filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (a.title ?? "").toLowerCase().includes(q) ||
      (a.summary ?? "").toLowerCase().includes(q) ||
      (a.village ?? "").toLowerCase().includes(q) ||
      (a.district ?? "").toLowerCase().includes(q) ||
      (a.survey_number ?? "").toLowerCase().includes(q) ||
      a.owner_names.some((n) => n.toLowerCase().includes(q)) ||
      a.persons.some((n) => n.toLowerCase().includes(q));
    const matchesRisk = risk === "ALL" || a.risk_level === risk;
    const matchesType = disputeType === "ALL" || a.dispute_type === disputeType;
    return matchesSearch && matchesRisk && matchesType;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl">Land articles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every land, property and ownership dispute article found in your uploaded newspapers.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="size-4" /> Filter articles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search title, location, survey number, names…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={risk} onValueChange={setRisk}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All risks</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={disputeType} onValueChange={setDisputeType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Dispute type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {DISPUTE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {articles?.length ?? 0} articles
          </p>
        </CardContent>
      </Card>

      {!filtered.length && (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <Newspaper className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No articles match your filters.</p>
          <Button variant="link" asChild>
            <Link to="/upload">Upload a newspaper to get started</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((article) => (
          <Link
            key={article.id}
            to="/articles/$articleId"
            params={{ articleId: article.id }}
            className="group flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-primary">{article.title}</h3>
              <RiskBadge risk={article.risk_level} className="shrink-0" />
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {article.summary || article.original_text?.slice(0, 160) || "No summary available."}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs text-muted-foreground">
              <VerificationBadge status={article.verification_status} />
              {article.dispute_type && <span className="rounded-md bg-secondary px-2 py-0.5">{article.dispute_type}</span>}
              {article.survey_number && <span>Survey {article.survey_number}</span>}
              {[article.village, article.taluk, article.district].filter(Boolean).join(" · ") && (
                <span>{[article.village, article.taluk, article.district].filter(Boolean).join(" · ")}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
