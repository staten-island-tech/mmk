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

  const { data: profile } = await supabase
    .from("user_stats")
    .select("onboarded, draft")
    .eq("uid", user.sub)
    .single();
  if (profile?.onboarded)
    // user must not already be onboarded
    throw createError({ statusCode: 403, message: "Already onboarded." });

  const config = useRuntimeConfig();

  if (profile?.draft) {
    // pull existing draft
    const cards = await $fetch<Card[]>(`${config.public.mmkPanelApi}/cards/`, {
      query: { id: profile.draft },
    });
    const card = cards[0];
    if (card) return { success: true, data: card };
  }

  const cards = await $fetch<Card[]>(
    `${config.public.mmkPanelApi}/cards/random/`,
    {
      query: { rarityWeight: 1 }, // should be Grade IV cards only
    },
  );
  const card = cards[0];
  if (!card)
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to draw card.",
    });

  const { error } = await supabase
    .from("user_stats")
    .update({ draft: card.id })
    .eq("uid", user.sub);
  if (error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update user draft card: ${error.message}`,
    });

  return { success: true, data: card };
});
