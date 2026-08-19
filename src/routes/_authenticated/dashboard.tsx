import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Newspaper, MapPin, Bell, TriangleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RiskBadge, VerificationBadge } from "@/components/app/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Land & Property Monitoring" },
      {
        name: "description",
        content:
          "Overview of uploaded newspapers, detected land disputes, monitored properties and active alerts.",
      },
      { property: "og:title", content: "Land & Property Monitoring Dashboard" },
      { property: "og:description", content: "Track detected land disputes and property alerts in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [papers, articles, properties, alerts, recent] = await Promise.all([
        supabase.from("newspapers").select("id", { count: "exact", head: true }),
        supabase.from("land_articles").select("id", { count: "exact", head: true }),
        supabase.from("monitored_properties").select("id", { count: "exact", head: true }),
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase
          .from("land_articles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      const high = (recent.data ?? []).filter((a) => a.risk_level === "HIGH").length;
      return {
        papers: papers.count ?? 0,
        articles: articles.count ?? 0,
        properties: properties.count ?? 0,
        alerts: alerts.count ?? 0,
        high,
        recent: recent.data ?? [],
      };
    },
  });

  const stats = [
    { label: "Newspapers uploaded", value: data?.papers ?? 0, icon: FileText },
    { label: "Land articles detected", value: data?.articles ?? 0, icon: Newspaper },
    { label: "Properties monitored", value: data?.properties ?? 0, icon: MapPin },
    { label: "New alerts", value: data?.alerts ?? 0, icon: Bell },
    { label: "High risk items", value: data?.high ?? 0, icon: TriangleAlert },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl">Land &amp; property monitoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Early warning from newspapers — always confirm with official land records.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <stat.icon className="size-5 text-primary" />
              <p className="mt-3 font-display text-3xl">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent land disputes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!data?.recent.length && (
            <p className="text-sm text-muted-foreground">
              No land articles yet. <Link to="/upload" className="text-primary underline">Upload a newspaper</Link> to start.
            </p>
          )}
          {data?.recent.map((article) => (
            <Link
              key={article.id}
              to="/articles/$articleId"
              params={{ articleId: article.id }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary/40"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{article.title}</p>
                <p className="text-xs text-muted-foreground">
                  {[article.survey_number && `Survey No. ${article.survey_number}`, article.village, article.district]
                    .filter(Boolean)
                    .join(" · ") || "Location not stated"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <VerificationBadge status={article.verification_status} />
                <RiskBadge risk={article.risk_level} />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}