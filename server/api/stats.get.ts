import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });

  // Get stats of user with retrieved UID
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("uid", user.user_metadata?.sub)
    .single();

  if (error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });

  return { data: data };
});
