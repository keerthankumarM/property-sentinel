import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyzeNewspaper } from "@/lib/newspapers.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({
    meta: [
      { title: "Upload newspapers — BhoomiWatch" },
      {
        name: "description",
        content:
          "Upload newspaper PDFs, scanned pages and images. OCR and AI automatically find land and property dispute articles.",
      },
      { property: "og:title", content: "Upload newspapers for land dispute scanning" },
      { property: "og:description", content: "OCR + AI reads full newspapers and extracts land dispute articles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadPage;
});

function UploadPage() {
  return null;
}