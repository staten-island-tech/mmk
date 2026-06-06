import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import type { Database } from "~/types/database.types";
import type { Card } from "~/types/collection";
import type { UserCardSimple } from "~/types/user";

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
    throw createError({ statusCode: 403, statusMessage: "Already onboarded." });

  if (!profile?.draft)
    throw createError({ statusCode: 400, statusMessage: "No card drawn." });

  const config = useRuntimeConfig();
  const cards = await $fetch<Card[]>(`${config.public.mmkPanelApi}/cards/`, {
    query: { id: profile.draft },
  });
  const card = cards[0];

  if (!card)
    throw createError({ statusCode: 500, statusMessage: "Card not found." });

  const cardSimplified: UserCardSimple = {
    id: card.id,
    moveIds: card.moves.map((move) => move.id),
    rarity: {
      id: card.rarity.id,
      weight: card.rarity.weight,
      name: card.rarity.name,
    },
  };

  const { error } = await supabase.rpc("add_card_to_user", {
    player_uid: user.sub,
    card: cardSimplified,
  });

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  await supabase
    .from("user_stats")
    .update({ onboarded: true, draft: null })
    .eq("uid", user.sub);

  return { success: true };
});
