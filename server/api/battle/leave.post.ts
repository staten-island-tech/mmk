import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { uid, matchId } = body;

  if (!uid || !matchId)
    throw createError({
      statusCode: 400,
      statusMessage: "Missing user ID or match ID.",
    });

  const supabase = serverSupabaseServiceRole<Database>(event);

  const { data: match } = await supabase
    .from("matches")
    .select("player1_uid, player2_uid, status")
    .eq("id", matchId)
    .single();

  if (!match || match.status === "finished" || match.status === "abandoned")
    // skip already abandoned matches
    return { success: true };

  const opponentUid =
    match.player1_uid === uid ? match.player2_uid : match.player1_uid;

  await supabase
    .from("matches")
    .update({
      status: "abandoned", // abandon match
      winner: opponentUid,
    })
    .eq("id", matchId);

  return { success: true };
});
