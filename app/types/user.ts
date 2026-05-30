/** User stats schema. */
export interface UserStats {
  /** The user ID. */
  readonly uid: string;
  /** The number of wins the user has. */
  readonly wins: number;
  /** The number of games the user has played. */
  readonly games: number;
  /** The array of card IDs the user owns. */
  readonly cards: UserCardSimple[];
}

/** Simplified user card schema. */
export interface UserCardSimple {
  /** The card ID. */
  readonly id: number;
  /** The card's move IDs. */
  readonly moveIds: number[];
  /** The card rarity. */
  readonly rarity: {
    /** The rarity ID. */
    readonly id: number;
    /** The rarity weight/order. */
    readonly weight: number;
    /** The rarity name. */
    readonly name: string;
  };
}
