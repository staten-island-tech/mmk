/** Redirects away from onboarding page if the user is already onboarded. */
export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return navigateTo("/login");

  const { data: stats } = (await supabase
    .from("user_stats")
    .select("onboarded")
    .eq("uid", user?.id)
    .single()) as { data: UserStats };

  if (stats?.onboarded) return navigateTo("/");
});
