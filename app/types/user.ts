import * as z from "zod";

/** Simplified user card schema. */
export const UserCardSimpleSchema = z.object({
  /** The card ID. */
  id: z.number(),
  /** The card's move IDs. */
  moveIds: z.array(z.number()),
  /** The card rarity. */
  rarity: z.object({
    /** The rarity ID. */
    id: z.number(),
    /** The rarity weight/order. */
    weight: z.number(),
    /** The rarity name. */
    name: z.string(),
  }),
});

/** User stats schema. */
export const UserStatsSchema = z.object({
  /** The user ID. */
  uid: z.string(),
  /** The number of wins the user has. */
  wins: z.number(),
  /** The number of games the user has played. */
  games: z.number(),
  /** The array of card IDs the user owns. */
  cards: z.array(UserCardSimpleSchema),
});

export type UserCardSimple = z.infer<typeof UserCardSimpleSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
