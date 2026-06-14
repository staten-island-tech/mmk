export {};

declare global {
  /** User stats schema. */
  interface UserStats {
    /** The user ID. */
    readonly uid: string;
    /** The number of wins the user has. */
    readonly wins: number;
    /** The number of games the user has played. */
    readonly games: number;
    /** Whether or not the user completed the onboarding. */
    readonly onboarded: boolean;
    /** The ID of the user's starter card drawn in the onboarding. */
    readonly draft: number;
    /** The card the user fights with in matches. */
    readonly battle_card?: string;
  }

  /** User card schema. */
  interface UserCard extends Card {
    /** The user card reference ID. */
    readonly reference_id: string;
    /** The date and time at which the user obtained the card. */
    readonly obtained_at?: string;
  }
}
