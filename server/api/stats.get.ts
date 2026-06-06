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

  const { data: statsData, error: statsError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("uid", user.sub)
    .single();
  if (statsError)
    throw createError({ statusCode: 500, statusMessage: statsError.message });

  const { data: cardsData, error: cardsError } = await supabase
    .from("user_cards")
    .select("*")
    .eq("uid", user.sub);
  if (cardsError)
    throw createError({ statusCode: 500, statusMessage: cardsError.message });

  return { success: true, data: { ...statsData, cards: cardsData } };
});
