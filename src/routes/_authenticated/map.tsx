import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Map as MapIcon, MapPin, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MapView } from "@/components/app/MapView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({
    meta: [
      { title: "Map view — BhoomiWatch" },
      { name: "description", content: "See your monitored properties and detected land dispute articles on a map." },
      { property: "og:title", content: "Map view — BhoomiWatch" },
      { property: "og:description", content: "Geographic view of monitored properties and land dispute articles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { data: articles } = useQuery({
    queryKey: ["land_articles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("land_articles").select("*");
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

  const locatedArticles = (articles ?? []).filter((a) => a.latitude != null && a.longitude != null);
  const locatedProperties = (properties ?? []).filter((p) => p.latitude != null && p.longitude != null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl">Map view</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Geographic view of your monitored properties and detected dispute articles.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <Newspaper className="size-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Articles with coordinates</p>
              <p className="font-display text-2xl">{locatedArticles.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <MapPin className="size-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Properties with coordinates</p>
              <p className="font-display text-2xl">{locatedProperties.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapIcon className="size-4" /> Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locatedArticles.length === 0 && locatedProperties.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-xl border border-dashed">
              <MapIcon className="size-8 text-muted-foreground" />
              <p className="mt-3 max-w-md px-6 text-center text-sm text-muted-foreground">
                No coordinates found yet. Add latitude and longitude to your properties, or upload articles that mention
                specific locations.
              </p>
            </div>
          ) : (
            <MapView articles={articles ?? []} properties={properties ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
