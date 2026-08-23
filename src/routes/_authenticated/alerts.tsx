import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RiskBadge } from "@/components/app/RiskBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — BhoomiWatch" },
      { name: "description", content: "Review alerts raised when newspaper articles match your monitored properties." },
      { property: "og:title", content: "Alerts — BhoomiWatch" },
      { property: "og:description", content: "Land dispute alerts matched to your monitored properties." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const queryClient = useQueryClient();

  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*, article:article_id(*), property:property_id(*)") // type-safe enough for display
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const markRead = async (id: string, read: boolean) => {
    const { error } = await supabase.from("alerts").update({ is_read: read }).eq("id", id);
    if (error) return;
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
  };

  const unread = (alerts ?? []).filter((a) => !a.is_read);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl">Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {unread.length ? `${unread.length} unread alert(s) need your attention.` : "No new alerts."}
        </p>
      </header>

      {!alerts?.length && (
        <Card>
          <CardContent className="px-6 py-12 text-center">
            <Bell className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No alerts yet.</p>
            <Button variant="link" asChild>
              <Link to="/properties">Add a property to monitor</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {alerts?.map((alert) => {
          const article = alert.article;
          const property = alert.property;
          return (
            <Card key={alert.id} className={alert.is_read ? "opacity-70" : ""}>
              <CardContent className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {!alert.is_read && <span className="size-2 rounded-full bg-primary" />}
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                    <RiskBadge risk={alert.risk_level} className="ml-1" />
                  </div>
                  <p className="font-medium">
                    {property?.label || property?.survey_number || "Monitored property"} may be affected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Matched article: <span className="font-medium text-foreground">{article?.title || "Untitled"}</span>
                  </p>
                  {alert.match_reason && (
                    <p className="flex items-start gap-1 text-xs text-muted-foreground">
                      <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                      {alert.match_reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/articles/$articleId" params={{ articleId: alert.article_id }}>
                      View article
                    </Link>
                  </Button>
                  {!alert.is_read ? (
                    <Button size="sm" variant="ghost" onClick={() => markRead(alert.id, true)}>
                      <CheckCircle2 className="mr-1 size-4" /> Mark read
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => markRead(alert.id, false)}>
                      Mark unread
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
