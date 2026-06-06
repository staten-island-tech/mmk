import * as z from "zod";

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
});

/** User card schema. */
export const UserCardSchema = z.object({
  /** The user card entry ID. */
  id: z.uuid(),
  /** The ID of the user owning the card. */
  uid: z.uuid(),
  /** The ID of the card. */
  card_id: z.int32(),
  /** The date and time at which the user obtained the card. */
  obtained_at: z.iso.datetime(),
});

export type UserStats = z.infer<typeof UserStatsSchema>;
export type UserCard = z.infer<typeof UserCardSchema>;
