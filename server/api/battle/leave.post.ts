import * as z from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "#shared/types/database.types";

const MatchAbandonmentSchema = z.object({
  uid: z.uuid(),
  matchId: z.uuid(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const bodyParsed = MatchAbandonmentSchema.safeParse(body);
  if (!bodyParsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: bodyParsed.error.issues[0]!.message,
    });

  const { uid, matchId } = bodyParsed.data;

  const supabase = serverSupabaseServiceRole<Database>(event);

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("player1_uid, player2_uid, status")
    .eq("id", matchId)
    .single();

  if (matchError)
    throw createError({
      statusCode: 500,
      statusMessage: matchError.message,
    });

  if (!match)
    throw createError({
      statusCode: 404,
      statusMessage: "Match not found.",
    });

  if (match.status === "finished" || match.status === "abandoned")
    return { success: true, alreadyFinalized: true };

  const isPlayer1 = match.player1_uid === uid;
  const isPlayer2 = match.player2_uid === uid;
  if (!isPlayer1 && !isPlayer2)
    throw createError({
      statusCode: 403,
      statusMessage: "User is not part of this match.",
    });

  const opponentUid = isPlayer1 ? match.player2_uid : match.player1_uid;

  const { error: updateError } = await supabase
    .from("matches")
    .update({
      status: "abandoned",
      winner: opponentUid,
    })
    .eq("id", matchId);
  if (updateError)
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message,
    });

  return { success: true, abandoned: true };
});
