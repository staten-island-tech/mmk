import * as z from "zod";
import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import type { Database } from "#shared/types/database.types";

const PrimaryCardSchema = z.object({
  id: z.uuid().nullable(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const bodyParsed = PrimaryCardSchema.safeParse(body);
  if (!bodyParsed.success)
    // validation failed
    throw createError({
      statusCode: 400,
      statusMessage: bodyParsed.error.issues[0]!.message,
    });

  const { id: cardId } = bodyParsed.data;

  const user = await serverSupabaseUser(event);
  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized." });

  const supabase = serverSupabaseServiceRole<Database>(event);

  /* We only want to check if a card with the specified card ID exists AND is owned by the signed-in user.
   * The data here is not used for anything else.
   */
  if (cardId) {
    const { data, error: cardsError } = await supabase
      .from("user_cards")
      .select("id")
      .eq("id", cardId)
      .eq("uid", user.sub)
      .maybeSingle();

    if (cardsError)
      throw createError({ statusCode: 500, statusMessage: cardsError.message });

    if (!data)
      throw createError({
        statusCode: 404,
        statusMessage: "Card not found or not owned by user.",
      });
  }

  const { error: statsError } = await supabase
    .from("user_stats")
    .update({ battle_card: cardId })
    .eq("uid", user.sub);
  if (statsError)
    throw createError({ statusCode: 500, statusMessage: statsError.message });

  return { success: true };
});
