import type { Database } from "~/types/database.types";

export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient<Database>();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return navigateTo("/login");

  const { data: stats } = (await supabase
    .from("user_stats")
    .select("onboarded")
    .eq("uid", user.id)
    .single()) as { data: { onboarded: boolean } | null };

  if (!stats?.onboarded) return navigateTo("/onboarding"); // must be onboarded
});
