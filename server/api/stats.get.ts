import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized." });

  const supabase = serverSupabaseServiceRole<Database>(event);

  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("uid", user.sub)
    .single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return { success: true, data: data };
});
