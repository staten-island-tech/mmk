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
  if (!bodyParsed.success) return;

  const { uid } = bodyParsed.data;

  const supabase = serverSupabaseServiceRole<Database>(event);

  await supabase.from("matchmaking_queue").delete().eq("uid", uid); // delete user from queue
  await supabase.from("matchmaking_heartbeats").delete().eq("uid", uid); // delete user from heartbeats
});
