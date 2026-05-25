/** User stats schema. */
export interface UserStats {
  /** The user ID. */
  readonly uid: string;
  /** The number of wins the user has. */
  readonly wins: number;
  /** The number of games the user has played. */
  readonly games: number;
  /** The array of card IDs the user owns. */
  readonly cards: number[];
}
