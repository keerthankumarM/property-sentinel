import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Calendar, FileText, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RiskBadge, VerificationBadge } from "@/components/app/RiskBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VERIFICATION_LABELS } from "@/lib/land";

export const Route = createFileRoute("/_authenticated/articles/$articleId")({
  head: ({ params }) => ({
    meta: [
      { title: "Article details — BhoomiWatch" },
      { name: "description", content: "Detailed view of a detected land or property dispute article." },
      { property: "og:title", content: "Article details — BhoomiWatch" },
      { property: "og:description", content: "Detailed view of a detected land or property dispute article." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  const { articleId } = useParams({ from: "/_authenticated/articles/$articleId" });

  const { data: article } = useQuery({
    queryKey: ["land_articles", articleId],
    queryFn: async () => {
      const { data, error } = await supabase.from("land_articles").select("*").eq("id", articleId).single();
      if (error) throw error;
      return data;
    },
  });

  if (!article) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/articles">
            <ArrowLeft className="mr-2 size-4" /> Back to articles
          </Link>
        </Button>
        <p className="text-muted-foreground">Article not found.</p>
      </div>
    );
  }

  const locationParts = [article.location, article.village, article.taluk, article.district, article.state].filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/articles">
          <ArrowLeft className="mr-2 size-4" /> Back to articles
        </Link>
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge risk={article.risk_level} />
          <VerificationBadge status={article.verification_status} />
          {article.dispute_type && <Badge variant="secondary">{article.dispute_type}</Badge>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard icon={MapPin} label="Location" value={locationParts.join(" · ") || "Not stated"} />
        <InfoCard icon={FileText} label="Survey number" value={article.survey_number || "Not stated"} />
        <InfoCard icon={Calendar} label="Publication date" value={article.publication_date || "Unknown"} />
        <InfoCard icon={User} label="Owner names" value={article.owner_names.join(", ") || "Not stated"} />
        <InfoCard
          icon={FileText}
          label="Confidence"
          value={article.confidence ? `${Math.round(article.confidence * 100)}%` : "Not scored"}
        />
        <InfoCard
          icon={FileText}
          label="Verification stage"
          value={VERIFICATION_LABELS[article.verification_status] ?? article.verification_status}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">English summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {article.summary || "No summary was generated for this article."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Original article text</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{article.original_text || "No original text available."}</p>
        </CardContent>
      </Card>

      {(article.persons.length > 0 || article.organizations.length > 0 || article.important_dates.length > 0 || article.court_info) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Extracted details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {article.persons.length > 0 && (
              <p>
                <span className="font-medium">Persons mentioned:</span> {article.persons.join(", ")}
              </p>
            )}
            {article.organizations.length > 0 && (
              <p>
                <span className="font-medium">Organizations:</span> {article.organizations.join(", ")}
              </p>
            )}
            {article.important_dates.length > 0 && (
              <p>
                <span className="font-medium">Important dates:</span> {article.important_dates.join(" · ")}
              </p>
            )}
            {article.court_info && (
              <p>
                <span className="font-medium">Court / legal info:</span> {article.court_info}
              </p>
            )}
            {article.area_extent && (
              <p>
                <span className="font-medium">Area extent:</span> {article.area_extent}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 pt-5">
        <Icon className="mt-0.5 size-4 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
