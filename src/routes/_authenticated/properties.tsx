import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, MapPin, Bell, BellOff, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

export const Route = createFileRoute("/_authenticated/properties")({
  head: () => ({
    meta: [
      { title: "Monitored properties — BhoomiWatch" },
      { name: "description", content: "Add and manage the land properties you want to monitor for disputes." },
      { property: "og:title", content: "Monitored properties — BhoomiWatch" },
      { property: "og:description", content: "Manage the properties you monitor for land disputes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PropertiesPage,
});

type PropertyForm = {
  label: string;
  survey_number: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  owner_name: string;
  area_extent: string;
  latitude: string;
  longitude: string;
  notify_email: boolean;
  notify_sms: boolean;
  notify_whatsapp: boolean;
};

const emptyForm: PropertyForm = {
  label: "",
  survey_number: "",
  village: "",
  taluk: "",
  district: "",
  state: "",
  owner_name: "",
  area_extent: "",
  latitude: "",
  longitude: "",
  notify_email: true,
  notify_sms: false,
  notify_whatsapp: false,
};

function PropertiesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyForm>(emptyForm);

  const { data: properties } = useQuery({
    queryKey: ["monitored_properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monitored_properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openNew = () => {
    reset();
    setDialogOpen(true);
  };

  const openEdit = (property: NonNullable<typeof properties>[number]) => {
    setForm({
      label: property.label ?? "",
      survey_number: property.survey_number ?? "",
      village: property.village ?? "",
      taluk: property.taluk ?? "",
      district: property.district ?? "",
      state: property.state ?? "",
      owner_name: property.owner_name ?? "",
      area_extent: property.area_extent ?? "",
      latitude: property.latitude?.toString() ?? "",
      longitude: property.longitude?.toString() ?? "",
      notify_email: property.notify_email,
      notify_sms: property.notify_sms,
      notify_whatsapp: property.notify_whatsapp,
    });
    setEditingId(property.id);
    setDialogOpen(true);
  };

  const save = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const payload = {
      user_id: userId,
      label: form.label || null,
      survey_number: form.survey_number || null,
      village: form.village || null,
      taluk: form.taluk || null,
      district: form.district || null,
      state: form.state || null,
      owner_name: form.owner_name || null,
      area_extent: form.area_extent || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      notify_email: form.notify_email,
      notify_sms: form.notify_sms,
      notify_whatsapp: form.notify_whatsapp,
    };

    const { error } = editingId
      ? await supabase.from("monitored_properties").update(payload).eq("id", editingId)
      : await supabase.from("monitored_properties").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editingId ? "Property updated" : "Property added");
    setDialogOpen(false);
    reset();
    queryClient.invalidateQueries({ queryKey: ["monitored_properties"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("monitored_properties").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Property removed");
    queryClient.invalidateQueries({ queryKey: ["monitored_properties"] });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl">Monitored properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the land you own or watch so BhoomiWatch can alert you when matching articles appear.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="mr-2 size-4" /> Add property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit property" : "Add a property"}</DialogTitle>
              <DialogDescription>
                Survey number, village and owner name are used to match newspaper articles.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. ancestral farm in Mandya"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="survey">Survey number</Label>
                <Input
                  id="survey"
                  value={form.survey_number}
                  onChange={(e) => setForm({ ...form, survey_number: e.target.value })}
                  placeholder="e.g. 142/2B"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="village">Village</Label>
                  <Input id="village" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taluk">Taluk</Label>
                  <Input id="taluk" value={form.taluk} onChange={(e) => setForm({ ...form, taluk: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="owner">Owner name</Label>
                  <Input id="owner" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="area">Area extent</Label>
                  <Input id="area" value={form.area_extent} onChange={(e) => setForm({ ...form, area_extent: e.target.value })} placeholder="e.g. 5 acres" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input id="lat" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input id="lng" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.notify_email} onCheckedChange={(v) => setForm({ ...form, notify_email: !!v })} />
                  Email alerts
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.notify_sms} onCheckedChange={(v) => setForm({ ...form, notify_sms: !!v })} />
                  SMS alerts
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.notify_whatsapp} onCheckedChange={(v) => setForm({ ...form, notify_whatsapp: !!v })} />
                  WhatsApp alerts
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save}>{editingId ? "Save changes" : "Add property"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {!properties?.length && (
        <Card>
          <CardContent className="px-6 py-12 text-center">
            <MapPin className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No properties monitored yet.</p>
            <Button variant="link" onClick={openNew}>
              Add your first property
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {properties?.map((property) => (
          <Card key={property.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-start justify-between gap-2 text-base">
                <span className="line-clamp-1">{property.label || property.survey_number || "Unnamed property"}</span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="size-7" onClick={() => openEdit(property)}>
                    <Edit3 className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => remove(property.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                {property.survey_number && <span>Survey {property.survey_number}</span>}
                {[property.village, property.taluk, property.district, property.state].filter(Boolean).join(" · ") && (
                  <span>{[property.village, property.taluk, property.district, property.state].filter(Boolean).join(" · ")}</span>
                )}
              </div>
              {property.owner_name && (
                <p>
                  <span className="font-medium">Owner:</span> {property.owner_name}
                </p>
              )}
              {property.area_extent && (
                <p>
                  <span className="font-medium">Area:</span> {property.area_extent}
                </p>
              )}
              <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                {property.notify_email ? (
                  <span className="flex items-center gap-1"><Bell className="size-3" /> Email</span>
                ) : (
                  <span className="flex items-center gap-1"><BellOff className="size-3" /> Email off</span>
                )}
                {property.notify_sms && <span className="flex items-center gap-1"><Bell className="size-3" /> SMS</span>}
                {property.notify_whatsapp && <span className="flex items-center gap-1"><Bell className="size-3" /> WhatsApp</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
