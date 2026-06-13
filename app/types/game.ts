export type BattleState =
  | "player_turn"
  | "dialogue"
  | "effects"
  | "prevented"
  | "finished";

export interface SyncedGameState {
  p1State: PlayerState;
  p2State: PlayerState;
  currentPlayer: 1 | 2;
  activeDomain: ActiveDomain | null;
  battleState: BattleState;
  winner: 1 | 2 | null;
  initialized: boolean;
  currentDialogue: DialogueLine | null;
  effectsMessage: string;
  preventedMessage: string;
}

export interface ActiveEffect {
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
  value: number;
  turnsLeft: number;
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  moveEnergy: number;
  maxMoveEnergy: number;
  moveEnergyGain: number;
  baseAttack: number;
  baseDefense: number;
  effectiveAttack: number;
  effectiveDefense: number;
  poisonTurns: number;
  poisonMultiplier: number;
  infiniteHealthTurns: number;
  preventedTurns: number;
  freshEffects: boolean;
  activeEffects: ActiveEffect[];
  moveCooldowns: Record<number, number>; // move.id, turns left
}

export interface ActiveDomain {
  componentName: string;
  turnsLeft: number;
}

export interface DialogueLine {
  speaker: string;
  text: string;
}
