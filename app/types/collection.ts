/** Rarity schema. */
export interface Rarity {
  /** The rarity ID. */
  readonly id: number;
  /** The rarity weight/order. */
  readonly weight: number;
  /** The rarity name. */
  readonly name: string;
  /** The rarity plate color as a hex string. */
  readonly plateColor: string;
  /** The desperation constant. */
  readonly desperationConstant: number;
}

/** Move schema. */
export interface Move {
  /** The move ID. */
  readonly id: number;
  /** The move name. */
  readonly name: string;
  /** The move cost. */
  readonly cost: number | null;
  /** The move damage. */
  readonly damage: number | null;

  // Self properties
  readonly selfDefenseMultiplier: [number, number] | null;
  readonly selfAttackMultiplier: [number, number] | null;
  readonly selfMoveEnergyMultiplier: [number, number] | null;
  readonly selfMoveEnergyGainMultiplier: [number, number] | null;
  readonly selfDesperationMultiplier: [number, number] | null;
  readonly selfDefenseScalarBoost: [number, number] | null;
  readonly selfAttackScalarBoost: [number, number] | null;
  readonly selfMoveEnergyScalarBoost: [number, number] | null;
  readonly selfMoveEnergyGainScalarBoost: [number, number] | null;
  readonly selfPoison: [number, number] | null;
  readonly selfPreventMove: number | null;
  readonly selfCustomDialogue: string | null;

  // Enemy properties
  readonly enemyDefenseMultiplier: [number, number] | null;
  readonly enemyAttackMultiplier: [number, number] | null;
  readonly enemyMoveEnergyMultiplier: [number, number] | null;
  readonly enemyMoveEnergyGainMultiplier: [number, number] | null;
  readonly enemyDesperationMultiplier: [number, number] | null;
  readonly enemyDefenseScalarBoost: [number, number] | null;
  readonly enemyAttackScalarBoost: [number, number] | null;
  readonly enemyMoveEnergyScalarBoost: [number, number] | null;
  readonly enemyMoveEnergyGainScalarBoost: [number, number] | null;
  readonly enemyDesperationScalarBoost: [number, number] | null;
  readonly enemyPoison: [number, number] | null;
  readonly enemyPreventMove: number | null;
  readonly enemyCustomDialogue: string | null;

  readonly domainComponentName: string | null;
  readonly domainLength: number | null;

}

/** Card move schema. */
export interface CardMove {
  /** The card move ID. */
  readonly id: number;
  /** The associated move. */
  readonly move: Move;
  /** The card move sprite URL, or null if using the card's default sprite. */
  readonly sprite: string | null;
}

/** Card schema. */
export interface Card {
  /** The card ID. */
  readonly id: number;
  /** The card name. */
  readonly name: string;
  /** The card nickname. */
  readonly nickname: string;
  /** The card description. */
  readonly description: string;
  /** The card default sprite URL. */
  readonly defaultSprite: string;
  /** The card audio URL, or null if no audio. */
  readonly audio: string | null;
  /** The card rarity. */
  readonly rarity: Rarity;
  /** The card health. */
  readonly health: number;
  /** The card defense. */
  readonly defense: number;
  /** The card base move energy. */
  readonly baseMoveEnergy: number;
  /** The card base move energy gain. */
  readonly baseMoveEnergyGain: number;
  /** The card desperation threshold. */
  readonly desperation: number;
  /** The card moves. */
  readonly moves: CardMove[];
}