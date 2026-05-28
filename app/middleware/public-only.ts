/**
 * Adds automatic redirect to the dashboard on certain pages if the user is logged in already.
 */
export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) return navigateTo("/", { replace: true });
});
