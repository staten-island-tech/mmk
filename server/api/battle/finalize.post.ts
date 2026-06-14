import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import { z } from "zod";
import type { Database } from "~/types/database.types";

const FinalizationSchema = z.object({
  matchId: z.uuid(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const bodyParsed = FinalizationSchema.safeParse(body);
  if (!bodyParsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: bodyParsed.error.issues[0]!.message,
    });

  const { matchId } = bodyParsed.data;

  const user = await serverSupabaseUser(event);
  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized." });

  const supabase = serverSupabaseServiceRole<Database>(event);

  const { data: match, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      player1_uid,
      player2_uid,
      winner,
      status,
      player1_finalized,
      player2_finalized
    `,
    )
    .eq("id", matchId)
    .single();

  if (error || !match)
    throw createError({ statusCode: 404, statusMessage: "Match not found." });

  if (!["finished", "abandoned"].includes(match.status))
    throw createError({
      statusCode: 400,
      statusMessage: "Match has not finished.",
    });

  const isPlayer1 = user.sub === match.player1_uid;
  const isPlayer2 = user.sub === match.player2_uid;

  if (!isPlayer1 && !isPlayer2)
    throw createError({
      statusCode: 403,
      statusMessage: "Not a participant.",
    });

  if (isPlayer1 && match.player1_finalized)
    return { success: true, alreadyFinalized: true };

  if (isPlayer2 && match.player2_finalized)
    return { success: true, alreadyFinalized: true };

  // Mark the player as finalized
  const { error: updateError } = await supabase
    .from("matches")
    .update(
      isPlayer1 ? { player1_finalized: true } : { player2_finalized: true },
    )
    .eq("id", matchId);

  if (updateError)
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message,
    });

  // Get wins and games played
  const { data: userStatsData, error: userStatsError } = await supabase
    .from("user_stats")
    .select("games, wins")
    .eq("uid", user.sub)
    .single();

  if (userStatsError || !userStatsData)
    throw createError({
      statusCode: 500,
      statusMessage: "Profile not found.",
    });

  const isWinner = match.winner === user.sub;

  const { error: userStatsUpdateError } = await supabase
    .from("user_stats")
    .update({
      games: (userStatsData.games ?? 0) + 1,
      wins: userStatsData.wins + (isWinner ? 1 : 0),
    })
    .eq("uid", user.sub);

  if (userStatsUpdateError)
    throw createError({
      statusCode: 500,
      statusMessage: userStatsUpdateError.message,
    });

  return { success: true };
});
