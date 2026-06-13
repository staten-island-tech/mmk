import * as z from "zod";
import { CardSchema } from "~/types/collection";

/** User stats schema. */
export const UserStatsSchema = z.object({
  /** The user ID. */
  uid: z.string(),
  /** The number of wins the user has. */
  wins: z.int32(),
  /** The number of games the user has played. */
  games: z.int32(),
  /** Whether or not the user completed the onboarding. */
  onboarded: z.boolean(),
  /** The ID of the user's starter card drawn in the onboarding. */
  draft: z.int32(),
  /** The card the user fights with in matches. */
  battle_card: z.uuid().optional(),
});

/** User card schema. */
export const UserCardSchema = CardSchema.extend({
  /** The user card reference ID. */
  reference_id: z.uuid(),
  /** The date and time at which the user obtained the card. */
  obtained_at: z.iso.datetime().optional(),
});

export type UserStats = z.infer<typeof UserStatsSchema>;
export type UserCard = z.infer<typeof UserCardSchema>;
