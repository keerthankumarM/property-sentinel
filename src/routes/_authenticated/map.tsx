import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";
import { geocodeMissing } from "@/lib/geo.functions";
import { coordsFor } from "@/lib/geo";
import { Suspense, lazy } from "react";
import { Map as MapIcon, MapPin, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MapView = lazy(() => import("@/components/app/MapView").then((m) => ({ default: m.MapView })));

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
  const queryClient = useQueryClient();
  const runGeocode = useServerFn(geocodeMissing);
  const geocode = useMutation({
    mutationFn: () => runGeocode({}),
    onSuccess: (res) => {
      toast.success(
        res.updated > 0 ? `Located ${res.updated} record(s) precisely.` : "No new precise locations found.",
      );
      queryClient.invalidateQueries({ queryKey: ["land_articles"] });
      queryClient.invalidateQueries({ queryKey: ["monitored_properties"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

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

  const locatedArticles = (articles ?? []).filter((a) => coordsFor(a) !== null);
  const locatedProperties = (properties ?? []).filter((p) => coordsFor(p) !== null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl">Map view</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Geographic view of your monitored properties and detected dispute articles. Records without exact
          coordinates are shown at their state location until refined.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => geocode.mutate()}
          disabled={geocode.isPending}
        >
          <Crosshair className="mr-2 size-4" />
          {geocode.isPending ? "Locating…" : "Refine locations"}
        </Button>
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
                Nothing to place on the map yet. Upload a newspaper or add a monitored property with a state,
                district or village.
              </p>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex h-[600px] items-center justify-center rounded-xl border bg-muted">
                  <p className="text-sm text-muted-foreground">Loading map…</p>
                </div>
              }
            >
              <MapView articles={articles ?? []} properties={properties ?? []} />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
