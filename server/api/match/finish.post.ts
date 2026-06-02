import * as z from "zod";
import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import type { Database } from "~/types/database.types";
import { CardSchema } from "~/types/collection";
import { UserCardSimple } from "~/types/user";

const CompletionSchema = z.object({
  card: CardSchema,
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const bodyParsed = CompletionSchema.safeParse(body);
  if (!bodyParsed.success) return;

  const { card } = bodyParsed.data;

  // Simplify card
  const cardSimplified: UserCardSimple = {
    id: card.id,
    moveIds: card.moves.map((move) => move.id),
    rarity: {
      id: card.rarity.id,
      weight: card.rarity.weight,
      name: card.rarity.name,
    },
  };

  const user = await serverSupabaseUser(event);

  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized." });

  const supabase = serverSupabaseServiceRole<Database>(event);

  const { error } = await supabase.rpc("add_card_to_user", {
    player_uid: user.sub,
    card: cardSimplified,
  });

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return {
    success: true,
    message: `Card added to user ${user.sub}.`,
  };
});
