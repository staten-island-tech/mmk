import * as z from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~/types/database.types";

const LeaveSchema = z.object({
  uid: z.uuid(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Parse data with schema
  const bodyParsed = LeaveSchema.safeParse(body);
  if (!bodyParsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: bodyParsed.error.issues[0]!.message,
    });

  const { uid } = bodyParsed.data;

  const supabase = serverSupabaseServiceRole<Database>(event);

  const { error: queueError } = await supabase
    .from("matchmaking_queue")
    .delete()
    .eq("uid", uid);
  if (queueError)
    throw createError({
      statusCode: 500,
      statusMessage: queueError.message,
    });

  const { error: heartbeatError } = await supabase
    .from("matchmaking_heartbeats")
    .delete()
    .eq("uid", uid);
  if (heartbeatError)
    throw createError({
      statusCode: 500,
      statusMessage: heartbeatError.message,
    });

  return { success: true };
});
