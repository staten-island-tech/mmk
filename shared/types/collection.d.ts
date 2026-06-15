export {};

declare global {
  /** A rarity. */
  interface Rarity {
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

  /** A domain for a move. */
  interface MoveDomain {
    /** The move domain ID. */
    readonly id: number;
    /** The component name to render. */
    readonly componentName: string;
  }

  /** A range specifying the minimum and maximum value for a move stat. */
  type MoveStatRange = readonly [min: number, max: number];

  /** A move. */
  interface Move {
    /** The move ID. */
    readonly id: number;
    /** The move name. */
    readonly name: string;
    /** The move cost. */
    readonly cost: number | null;
    /** The move damage. */
    readonly damage: number | null;
    /** The move cooldown duration (in moves). */
    readonly cooldownDuration: number;
    /** The domain component triggered by this move. */
    readonly domain: MoveDomain | null;
    /** The duration of the domain (in moves). */
    readonly domainDuration: number;
    /** Defense multiplier applied to the user. */
    readonly selfDefenseMultiplier: MoveStatRange | null;
    /** Attack multiplier applied to the user. */
    readonly selfAttackMultiplier: MoveStatRange | null;
    /** Move energy multiplier applied to the user. */
    readonly selfMoveEnergyMultiplier: MoveStatRange | null;
    /** Energy gain multiplier applied to the user per turn. */
    readonly selfMoveEnergyGainMultiplier: MoveStatRange | null;
    /** Desperation scaling multiplier applied to the user. */
    readonly selfDesperationMultiplier: MoveStatRange | null;
    /** Flat defense scaling bonus applied to the user. */
    readonly selfDefenseScalarBoost: MoveStatRange | null;
    /** Flat attack scaling bonus applied to the user. */
    readonly selfAttackScalarBoost: MoveStatRange | null;
    /** Flat move energy bonus applied to the user. */
    readonly selfMoveEnergyScalarBoost: MoveStatRange | null;
    /** Flat energy gain bonus applied to the user. */
    readonly selfMoveEnergyGainScalarBoost: MoveStatRange | null;
    /** Poison applied to the user. [damage per turn, duration] */
    readonly selfPoison: MoveStatRange | null;
    /** Number of turns the user is prevented from acting. */
    readonly selfPreventMove: number | null;
    /** Custom dialogue triggered when the move is used. */
    readonly selfCustomDialogue: string | null;

    /** Defense multiplier applied to the enemy. */
    readonly enemyDefenseMultiplier: MoveStatRange | null;
    /** Attack multiplier applied to the enemy. */
    readonly enemyAttackMultiplier: MoveStatRange | null;
    /** Move energy multiplier applied to the enemy. */
    readonly enemyMoveEnergyMultiplier: MoveStatRange | null;
    /** Energy gain multiplier applied to the enemy per turn. */
    readonly enemyMoveEnergyGainMultiplier: MoveStatRange | null;
    /** Desperation scaling multiplier applied to the enemy. */
    readonly enemyDesperationMultiplier: MoveStatRange | null;
    /** Flat defense scaling bonus applied to the enemy. */
    readonly enemyDefenseScalarBoost: MoveStatRange | null;
    /** Flat attack scaling bonus applied to the enemy. */
    readonly enemyAttackScalarBoost: MoveStatRange | null;
    /** Flat move energy bonus applied to the enemy. */
    readonly enemyMoveEnergyScalarBoost: MoveStatRange | null;
    /** Flat energy gain bonus applied to the enemy. */
    readonly enemyMoveEnergyGainScalarBoost: MoveStatRange | null;
    /** Flat desperation scaling bonus applied to the enemy. */
    readonly enemyDesperationScalarBoost: MoveStatRange | null;
    /** Poison applied to the enemy. [damage per turn, duration] */
    readonly enemyPoison: MoveStatRange | null;
    /** Number of turns the enemy is prevented from acting. */
    readonly enemyPreventMove: number | null;
    /** Custom dialogue triggered when the move affects the enemy. */
    readonly enemyCustomDialogue: string | null;
  }

  /** A move for a card. */
  interface CardMove {
    /** The card move ID. */
    readonly id: number;
    /** The associated move. */
    readonly move: Move;
    /** The card move sprite URL, or null if using the card's default sprite. */
    readonly sprite: string | null;
  }

  /** A card. */
  interface Card {
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
    readonly moves: readonly CardMove[];
  }
}
