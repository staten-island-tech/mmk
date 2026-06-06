import * as z from "zod";

/** Simplified user card schema. */
export const UserCardSimpleSchema = z.object({
  /** The card ID. */
  id: z.int(),
  /** The card's move IDs. */
  moveIds: z.array(z.number()),
  /** The card rarity. */
  rarity: z.object({
    /** The rarity ID. */
    id: z.int(),
    /** The rarity weight/order. */
    weight: z.int(),
    /** The rarity name. */
    name: z.string(),
  }),
});

/** User stats schema. */
export const UserStatsSchema = z.object({
  /** The user ID. */
  uid: z.string(),
  /** The number of wins the user has. */
  wins: z.int32(),
  /** The number of games the user has played. */
  games: z.int32(),
  /** The array of card IDs the user owns. */
  cards: z.array(UserCardSimpleSchema),
  /** Whether or not the user completed the onboarding. */
  onboarded: z.boolean(),
  /** The ID of the user's starter card drawn in the onboarding. */
  draft: z.int32(),
});

export type UserCardSimple = z.infer<typeof UserCardSimpleSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
