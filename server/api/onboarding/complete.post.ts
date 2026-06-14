import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import type { Database } from "#shared/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized." });

  const supabase = serverSupabaseServiceRole<Database>(event);

  // Get user `onboarded` and `draft`
  const { data: profile } = await supabase
    .from("user_stats")
    .select("onboarded, draft")
    .eq("uid", user.sub)
    .single();
  if (profile?.onboarded)
    throw createError({ statusCode: 403, statusMessage: "Already onboarded." });
  if (!profile?.draft)
    throw createError({ statusCode: 400, statusMessage: "No card drawn yet." });

  // Add new card entry to user cards
  const { error: cardsError } = await supabase.from("user_cards").insert({
    uid: user.sub,
    card_id: profile.draft,
  });
  if (cardsError)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to add card to user profile: ${cardsError.message}`,
    });

  // Set `onboarded` status to true
  const { error: statsError } = await supabase
    .from("user_stats")
    .update({ onboarded: true, draft: null })
    .eq("uid", user.sub);
  if (statsError)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update user onboarded status: ${statsError.message}`,
    });

  return { success: true };
});
