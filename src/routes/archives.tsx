import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Landmark, Search, ScrollText, CalendarDays, MapPin, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTICE_TYPE_LABELS, NOTICE_TYPES, STATES, districtsFor } from "@/lib/rules";

export const Route = createFileRoute("/archives")({
  head: () => ({
    meta: [
      { title: "Bihar Rules & Policy Archives — Jahernotice Blog | BhoomiWatch" },
      {
        name: "description",
        content:
          "Browse land rules, policies, circulars and Jahernotice public notices published state-wise and district-wise, starting with Bihar.",
      },
      { property: "og:title", content: "Bihar Rules & Policy Archives — Jahernotice Blog" },
      {
        property: "og:description",
        content: "State and district wise archive of land rules, policies and Jahernotice public notices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArchivesPage,
});

const ALL = "__all__";

function ArchivesPage() {
  const [state, setState] = useState<string>(ALL);
  const [district, setDistrict] = useState<string>(ALL);
  const [type, setType] = useState<string>(ALL);
  const [search, setSearch] = useState("");

  const { data: notices, isLoading } = useQuery({
    queryKey: ["policy_notices", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policy_notices")
        .select("*")
        .eq("is_published", true)
        .order("effective_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (notices ?? []).filter((n) => {
      if (state !== ALL && n.state !== state) return false;
      if (district !== ALL && n.district !== district) return false;
      if (type !== ALL && n.notice_type !== type) return false;
      if (!q) return true;
      return [n.title, n.summary, n.body, n.reference_number, n.issuing_authority, n.district, n.block]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [notices, state, district, type, search]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-card px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <Landmark className="size-6" />
          <span className="font-display text-lg">BhoomiWatch</span>
        </Link>
        <Button asChild size="sm">
          <Link to="/rules">Publish a rule</Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:px-6">
        <div className="space-y-2">
          <Badge variant="secondary" className="gap-1">
            <ScrollText className="size-3" /> Jahernotice Blog
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl">&nbsp;Rules &amp; Policy Archives</h1>
          <p className="max-w-2xl text-muted-foreground">
            A searchable archive of land rules, policies, circulars, gazette notifications and Jahernotice
            public notices — organised by state and district. Always verify against the original
            government publication before acting.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-4 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search notices"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={state}
            onValueChange={(v) => {
              setState(v);
              setDistrict(ALL);
            }}
          >
            <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All states</SelectItem>
              {STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All districts</SelectItem>
              {districtsFor(state === ALL ? null : state).map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {NOTICE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{NOTICE_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {isLoading ? "" : `${filtered.length} notice${filtered.length === 1 ? "" : "s"} found`}
        </p>

        <div className="mt-4 space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading archive…</p>}
          {!isLoading && filtered.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No notices match this search. Try clearing the filters, or publish the first notice for this
                state and district.
              </CardContent>
            </Card>
          )}
          {filtered.map((n) => (
            <Card key={n.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{NOTICE_TYPE_LABELS[n.notice_type] ?? n.notice_type}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="size-3" />
                    {[n.district, n.state].filter(Boolean).join(", ")}
                  </Badge>
                  {n.effective_date && (
                    <Badge variant="secondary" className="gap-1">
                      <CalendarDays className="size-3" /> {n.effective_date}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{n.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {n.summary && <p className="text-muted-foreground">{n.summary}</p>}
                {n.body && <p className="whitespace-pre-wrap leading-relaxed">{n.body}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {n.reference_number && <span>Ref: {n.reference_number}</span>}
                  {n.issuing_authority && <span>Issued by: {n.issuing_authority}</span>}
                  {n.block && <span>Block/Taluk: {n.block}</span>}
                </div>
                {n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {n.tags.map((t) => (
                      <Badge key={t} variant="outline">{t}</Badge>
                    ))}
                  </div>
                )}
                {n.source_url && (
                  <a
                    href={n.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary underline"
                  >
                    Official source <ExternalLink className="size-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t px-6 py-6 text-xs text-muted-foreground">
        Archive content is informational. Verify every rule or notice against the official government
        publication before acting.
      </footer>
    </div>
  );
}
