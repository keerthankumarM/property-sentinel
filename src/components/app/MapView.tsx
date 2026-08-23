import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@tanstack/react-router";
import { RiskBadge } from "./RiskBadge";
import type { Tables } from "@/integrations/supabase/types";

type Article = Tables<"land_articles">;
type Property = Tables<"monitored_properties">;

const articleIcon = new Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23c2410c' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

const propertyIcon = new Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23166534' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export function MapView({ articles, properties }: { articles: Article[]; properties: Property[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const locatedArticles = articles.filter((a) => a.latitude != null && a.longitude != null);
  const locatedProperties = properties.filter((p) => p.latitude != null && p.longitude != null);

  const center: LatLngExpression =
    locatedArticles[0] || locatedProperties[0]
      ? [locatedArticles[0]?.latitude ?? locatedProperties[0]?.latitude!, locatedArticles[0]?.longitude ?? locatedProperties[0]?.longitude!]
      : [20.5937, 78.9629]; // India center

  if (!mounted) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border bg-muted">
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    );
  }

  return (
    <MapContainer center={center} zoom={6} scrollWheelZoom className="h-[600px] w-full rounded-xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locatedProperties.map((p) => (
        <Marker key={`p-${p.id}`} position={[p.latitude!, p.longitude!]} icon={propertyIcon}>
          <Popup>
            <div className="space-y-1 min-w-[180px]">
              <p className="font-medium">{p.label || p.survey_number || "Monitored property"}</p>
              <p className="text-xs text-muted-foreground">
                {[p.village, p.taluk, p.district].filter(Boolean).join(" · ")}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
      {locatedArticles.map((a) => (
        <Marker key={`a-${a.id}`} position={[a.latitude!, a.longitude!]} icon={articleIcon}>
          <Popup>
            <div className="space-y-1 min-w-[220px]">
              <p className="font-medium leading-tight">{a.title}</p>
              <RiskBadge risk={a.risk_level} />
              <p className="text-xs text-muted-foreground">
                {[a.village, a.taluk, a.district].filter(Boolean).join(" · ")}
              </p>
              <Link
                to="/articles/$articleId"
                params={{ articleId: a.id }}
                className="inline-block pt-1 text-xs font-medium text-primary hover:underline"
              >
                View article
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
