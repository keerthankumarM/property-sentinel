import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, ScrollText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTICE_TYPE_LABELS, NOTICE_TYPES, STATES, districtsFor } from "@/lib/rules";

export const Route = createFileRoute("/_authenticated/rules")({
  head: () => ({
    meta: [
      { title: "Publish rules & Jahernotices — BhoomiWatch" },
      {
        name: "description",
        content: "Publish land rules, policies and Jahernotice public notices state-wise and district-wise.",
      },
      { property: "og:title", content: "Publish rules & Jahernotices — BhoomiWatch" },
      {
        property: "og:description",
        content: "Add land rules, policies and public notices to the Bihar Rules & Policy Archives.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RulesPage,
});

type NoticeForm = {
  title: string;
  notice_type: string;
  state: string;
  district: string;
  block: string;
  summary: string;
  body: string;
  reference_number: string;
  issuing_authority: string;
  effective_date: string;
  source_url: string;
  tags: string;
  is_published: boolean;
};

const emptyForm: NoticeForm = {
  title: "",
  notice_type: "RULE",
  state: "Bihar",
  district: "",
  block: "",
  summary: "",
  body: "",
  reference_number: "",
  issuing_authority: "",
  effective_date: "",
  source_url: "",
  tags: "",
  is_published: true,
};

function RulesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NoticeForm>(emptyForm);

  const { data: notices } = useQuery({
    queryKey: ["policy_notices", "mine"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policy_notices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const set = <K extends keyof NoticeForm>(key: K, value: NoticeForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (n: NonNullable<typeof notices>[number]) => {
    setEditingId(n.id);
    setForm({
      title: n.title,
      notice_type: n.notice_type,
      state: n.state,
      district: n.district ?? "",
      block: n.block ?? "",
      summary: n.summary ?? "",
      body: n.body ?? "",
      reference_number: n.reference_number ?? "",
      issuing_authority: n.issuing_authority ?? "",
      effective_date: n.effective_date ?? "",
      source_url: n.source_url ?? "",
      tags: n.tags.join(", "),
      is_published: n.is_published,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Give the rule or notice a title.");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const payload = {
      user_id: userData.user.id,
      title: form.title.trim(),
      notice_type: form.notice_type,
      state: form.state,
      district: form.district || null,
      block: form.block || null,
      summary: form.summary || null,
      body: form.body || null,
      reference_number: form.reference_number || null,
      issuing_authority: form.issuing_authority || null,
      effective_date: form.effective_date || null,
      source_url: form.source_url || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_published: form.is_published,
    };

    const { error } = editingId
      ? await supabase.from("policy_notices").update(payload).eq("id", editingId)
      : await supabase.from("policy_notices").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Notice updated" : "Notice published");
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["policy_notices"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("policy_notices").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Notice deleted");
    queryClient.invalidateQueries({ queryKey: ["policy_notices"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl">
            <ScrollText className="size-6 text-primary" /> Rules &amp; policy archives
          </h1>
          <p className="mt-1 text-muted-foreground">
            Publish land rules, policies, circulars and Jahernotice public notices by state and district.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/archives">
              View public archive <ExternalLink className="ml-2 size-4" />
            </Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="mr-2 size-4" /> New rule / notice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit notice" : "Publish rule or notice"}</DialogTitle>
                <DialogDescription>
                  Notices marked as published appear on the public Jahernotice blog.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.notice_type} onValueChange={(v) => set("notice_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NOTICE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{NOTICE_TYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>State</Label>
                  <Select
                    value={form.state}
                    onValueChange={(v) => {
                      set("state", v);
                      set("district", "");
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>District</Label>
                  <Select value={form.district || undefined} onValueChange={(v) => set("district", v)}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>
                      {districtsFor(form.state).map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="block">Block / Taluk</Label>
                  <Input id="block" value={form.block} onChange={(e) => set("block", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="ref">Reference number</Label>
                  <Input id="ref" value={form.reference_number} onChange={(e) => set("reference_number", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="auth">Issuing authority</Label>
                  <Input id="auth" value={form.issuing_authority} onChange={(e) => set("issuing_authority", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="date">Effective date</Label>
                  <Input id="date" type="date" value={form.effective_date} onChange={(e) => set("effective_date", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="src">Official source URL</Label>
                  <Input id="src" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea id="summary" rows={2} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="body">Full text</Label>
                  <Textarea id="body" rows={6} value={form.body} onChange={(e) => set("body", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="mutation, dakhil kharij, encroachment" />
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <Switch id="pub" checked={form.is_published} onCheckedChange={(v) => set("is_published", v)} />
                  <Label htmlFor="pub">Publish on the public archive</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save}>{editingId ? "Save changes" : "Publish"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {(notices ?? []).length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No rules or notices yet. Publish your first one for a state and district.
            </CardContent>
          </Card>
        )}
        {(notices ?? []).map((n) => (
          <Card key={n.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{NOTICE_TYPE_LABELS[n.notice_type] ?? n.notice_type}</Badge>
                <Badge variant="outline">{[n.district, n.state].filter(Boolean).join(", ")}</Badge>
                {!n.is_published && <Badge variant="secondary">Draft</Badge>}
                {n.effective_date && <Badge variant="secondary">{n.effective_date}</Badge>}
              </div>
              <CardTitle className="text-lg">{n.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {n.summary && <p className="text-sm text-muted-foreground">{n.summary}</p>}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(n)}>
                  <Edit3 className="mr-2 size-4" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(n.id)}>
                  <Trash2 className="mr-2 size-4" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
