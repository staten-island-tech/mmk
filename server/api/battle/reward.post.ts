import * as z from "zod";
import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import type { Database } from "~/types/database.types";

const RewardClaimSchema = z.object({
  matchId: z.uuid(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const bodyParsed = RewardClaimSchema.safeParse(body);
  if (!bodyParsed.success)
    // validation failed
    throw createError({
      statusCode: 400,
      statusMessage: bodyParsed.error.issues[0]!.message,
    });

  const { matchId } = bodyParsed.data;

  const user = await serverSupabaseUser(event);
  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized." });

  const config = useRuntimeConfig();
  const supabase = serverSupabaseServiceRole<Database>(event);

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("winner, status, rewarded")
    .eq("id", matchId)
    .single();

  if (matchError)
    throw createError({ statusCode: 500, statusMessage: matchError.message });

  if (!matchData)
    throw createError({ statusCode: 404, statusMessage: "Match not found." });

  if (matchData.winner !== user.sub)
    throw createError({
      statusCode: 403,
      statusMessage: "Not the winner or a participant of the match.",
    });

  if (matchData.status !== "finished" && matchData.status !== "abandoned")
    throw createError({ statusCode: 400, statusMessage: "Match not over." });

  if (matchData.rewarded) return { success: true, alreadyRewarded: true };

  // Get all card IDs owned by the user
  const { data: userCardsData, error: userCardsError } = await supabase
    .from("user_cards")
    .select("card_id")
    .eq("uid", user.sub);
  if (userCardsError)
    throw createError({
      statusCode: 500,
      statusMessage: userCardsError.message,
    });

  let randomCard: Card;

  try {
    const excludeIds = userCardsData.map((c) => c.card_id).join(",");

    const response = await $fetch(`${config.public.mmkPanelApi}/cards/random`, {
      query: { excludeId: excludeIds }, // get all card IDs except for the ones owned by the user
    });
    randomCard = Array.isArray(response) ? response[0] : response;

    if (!randomCard || !randomCard.id)
      throw new Error("Failed to fetch random card.");

    const { error: insertError } = await supabase.from("user_cards").insert({
      uid: user.sub,
      card_id: randomCard.id,
    }); // award card to user

    if (insertError)
      throw new Error(`Failed to reward card: ${insertError.message}`);

    await supabase.from("matches").update({ rewarded: true }).eq("id", matchId); // mark match as rewarded
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      statusMessage: e.message || "Error rewarding card.",
    });
  }

  return { success: true, card: randomCard };
});
