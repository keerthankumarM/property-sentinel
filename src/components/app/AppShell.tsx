import { Link, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Upload,
  Newspaper,
  MapPin,
  Bell,
  Landmark,
  LogOut,
  Map,
  ScrollText,
} from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload newspapers", icon: Upload },
  { to: "/articles", label: "Land articles", icon: Newspaper },
  { to: "/properties", label: "Monitored properties", icon: MapPin },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/map", label: "Map view", icon: Map },
  { to: "/rules", label: "Rules & archives", icon: ScrollText },
];

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Landmark className="size-6 text-sidebar-primary" />
          <div className="leading-tight">
            <p className="font-display text-lg">BhoomiWatch</p>
            <p className="text-[11px] text-sidebar-foreground/60">Land dispute monitoring</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              }}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" onClick={signOut} className="justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="size-4" /> Sign out
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 overflow-x-auto border-b bg-card px-4 py-3 md:hidden">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="whitespace-nowrap text-sm text-muted-foreground" activeProps={{ className: "whitespace-nowrap text-sm font-semibold text-primary" }}>
              {item.label}
            </Link>
          ))}
        </header>
        <main className="min-w-0 flex-1 px-4 py-8 md:px-10">{children}</main>
        <footer className="border-t px-4 py-4 text-xs text-muted-foreground md:px-10">
          AI-detected information is an early warning only. Always verify the original article and
          official land records before acting.
        </footer>
      </div>
    </div>
  );
}