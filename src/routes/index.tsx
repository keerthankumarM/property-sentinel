import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Landmark, Upload, Search, ShieldAlert, Map, Bell, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BhoomiWatch — AI Land & Property Dispute Monitoring" },
      {
        name: "description",
        content:
          "Upload newspapers, scanned pages and public notices. BhoomiWatch uses AI to find land, property and ownership disputes and alert you when they affect your land.",
      },
      { property: "og:title", content: "BhoomiWatch — AI Land & Property Dispute Monitoring" },
      {
        property: "og:description",
        content: "Early warning system for land disputes from newspapers and public notices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthenticated(!!data.session));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-card px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <Landmark className="size-6" />
          <span className="font-display text-xl">BhoomiWatch</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/archives">Archives</Link>
          </Button>
          {authenticated ? (
            <Button asChild>
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl leading-tight md:text-6xl">
              Catch land disputes before they become your problem
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              BhoomiWatch scans newspapers, scanned pages and public notices with AI, then alerts you when articles
              mention your survey numbers, villages, owners or properties.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/auth">
                  Start monitoring <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t bg-secondary/30 px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl md:text-3xl">How it works</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <StepCard
                icon={Upload}
                title="Upload"
                description="Upload newspaper PDFs, scanned pages or images. Regional languages are supported."
              />
              <StepCard
                icon={Search}
                title="AI extraction"
                description="OCR and AI identify land, property, ownership and boundary dispute articles, plus survey numbers and locations."
              />
              <StepCard
                icon={Bell}
                title="Get alerted"
                description="We match articles against your monitored properties and notify you by email, SMS or WhatsApp."
              />
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl md:text-3xl">Everything you need to stay informed</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={ShieldAlert}
                title="Risk scoring"
                description="Each article is scored HIGH, MEDIUM or LOW based on the severity of the dispute."
              />
              <FeatureCard
                icon={Search}
                title="Structured extraction"
                description="Survey numbers, villages, taluks, districts, owner names, courts and dates are pulled automatically."
              />
              <FeatureCard
                icon={Map}
                title="Map view"
                description="See properties and articles with coordinates on an interactive map."
              />
              <FeatureCard
                icon={CheckCircle2}
                title="Verification layers"
                description="Track verification from AI-detected to source-verified and official-record confirmed."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>BhoomiWatch — AI-powered land and property dispute monitoring.</p>
        <p className="mt-1 text-xs">
          AI-detected information is an early warning only. Always verify the original article and official land records
          before acting.
        </p>
      </footer>
    </div>
  );
}

function StepCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <Card className="text-center">
      <CardContent className="px-6 py-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="size-6 text-primary" />
        </div>
        <h3 className="mt-4 font-display text-xl">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-3 px-5 py-5">
        <Icon className="size-5 text-primary" />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
