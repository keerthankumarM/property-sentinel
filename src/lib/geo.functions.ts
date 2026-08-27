import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { geocodePlace, sleep } from "./geo.server";

export const geocodeMissing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    let updated = 0;

    const { data: articles } = await supabase
      .from("land_articles")
      .select("id, village, taluk, district, state, location")
      .eq("user_id", userId)
      .is("latitude", null)
      .limit(25);

    for (const a of articles ?? []) {
      const hit =
        (await geocodePlace([a.village, a.district, a.state])) ??
        (await geocodePlace([a.taluk, a.district, a.state])) ??
        (await geocodePlace([a.district, a.state])) ??
        (await geocodePlace([a.location, a.state]));
      if (hit) {
        await supabase.from("land_articles").update(hit).eq("id", a.id);
        updated += 1;
      }
      await sleep(1100);
    }

    const { data: properties } = await supabase
      .from("monitored_properties")
      .select("id, village, taluk, district, state")
      .eq("user_id", userId)
      .is("latitude", null)
      .limit(25);

    for (const p of properties ?? []) {
      const hit =
        (await geocodePlace([p.village, p.district, p.state])) ??
        (await geocodePlace([p.taluk, p.district, p.state])) ??
        (await geocodePlace([p.district, p.state]));
      if (hit) {
        await supabase.from("monitored_properties").update(hit).eq("id", p.id);
        updated += 1;
      }
      await sleep(1100);
    }

    return { updated };
  });
