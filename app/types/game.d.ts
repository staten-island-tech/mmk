export {};

declare global {
  /** The instantaneous state of the battle system. */
  export type BattleState =
    | "player_turn"
    | "dialogue"
    | "effects"
    | "prevented"
    | "finished";

  /** Synchronized game state shared between clients and the server. */
  export interface SyncedGameState {
    /** Player 1 state. */
    p1State: PlayerState;
    /** Player 2 state. */
    p2State: PlayerState;
    /** Whose turn it currently is (1 or 2). */
    currentPlayer: 1 | 2;
    /** Active domain effect currently applied in battle, if any. */
    activeDomain: ActiveDomain | null;
    /** Current phase of the battle loop. */
    battleState: BattleState;
    /** Winner of the match (1 or 2), or null if not finished. */
    winner: 1 | 2 | null;
    /** Whether the game has been fully initialized. */
    initialized: boolean;
    /** Currently active dialogue line, if any. */
    currentDialogue: DialogueLine | null;
    /** Human-readable battle effects message log. */
    effectsMessage: string;
    /** Message shown when a player is prevented from acting. */
    preventedMessage: string;
    /** Details about the last move made in the game. */
    lastMove?: {
      name: string;
      damage: number | null;
      player: 1 | 2;
      username: string;
      type: string;
    } | null;
  }

  /** A single temporary effect applied to a player. */
  export interface ActiveEffect {
    /** Type of effect applied. */
    type:
      | "attackMul"
      | "defenseMul"
      | "energyMul"
      | "energyGainMul"
      | "desperationMul"
      | "attackAdd"
      | "defenseAdd"
      | "energyAdd"
      | "energyGainAdd"
      | "desperationAdd"
      | "poison";
    /** Numeric value of the effect (multiplier or additive value depending on type). */
    value: number;
    /** Number of turns remaining before the effect expires. */
    turnsLeft: number;
  }

  /** Runtime state of a player during a match. */
  export interface PlayerState {
    /** Current health points. */
    hp: number;
    /** Maximum health points. */
    maxHp: number;
    /** Current available move energy. */
    moveEnergy: number;
    /** Maximum move energy capacity. */
    maxMoveEnergy: number;
    /** Passive energy gained per turn. */
    moveEnergyGain: number;
    /** Base attack stat before modifiers. */
    baseAttack: number;
    /** Base defense stat before modifiers. */
    baseDefense: number;
    /** Final computed attack after modifiers. */
    effectiveAttack: number;
    /** Final computed defense after modifiers. */
    effectiveDefense: number;
    /** Remaining poison duration in turns. */
    poisonTurns: number;
    /** Damage multiplier applied by poison. */
    poisonMultiplier: number;
    /** Turns of invulnerability or infinite health effects. */
    infiniteHealthTurns: number;
    /** Number of turns the player is prevented from acting. */
    preventedTurns: number;
    /** Whether effects were freshly applied this turn. */
    freshEffects: boolean;
    /** Active status effects currently affecting the player. */
    activeEffects: ActiveEffect[];
    /**
     * Map of cooldowns for moves.
     * - Key: move ID under the cooldown
     * - Value: number of turns remaining until the move can be used again
     */
    moveCooldowns: Record<number, number>;
  }

  /** A domain effect currently active in battle. */
  export interface ActiveDomain {
    /** Component name used to render the domain effect visually. */
    componentName: string;
    /** Number of turns remaining before the domain expires. */
    turnsLeft: number;
  }

  /** A single line of dialogue shown during battle. */
  export interface DialogueLine {
    /** Name of the speaker. */
    speaker: string;
    /** Dialogue text content. */
    text: string;
  }
}
