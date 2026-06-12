import type { Card, CardMove } from "~/types/collection";
import type { PlayerState, ActiveDomain, BattleState } from "~/types/game";

export function useBattleEngine(
  p1State: Ref<PlayerState | null>,
  p2State: Ref<PlayerState | null>,
  p1Card: Ref<Card | null>,
  p2Card: Ref<Card | null>,
  currentPlayer: Ref<1 | 2>,
  battleState: Ref<BattleState>,
  winner: Ref<1 | 2 | null>,
  activeDomain: Ref<ActiveDomain | null>,
  domainJustActivated: Ref<boolean>,
  effectsMessage: Ref<string>,
) {
  let pendingTurnSwitch: (() => void) | null = null;

  function onEffectsFinished() {
    pendingTurnSwitch?.();
    pendingTurnSwitch = null;
  }

  function buildEffectsMessage(): string {
    if (!p1State.value || !p2State.value || !p1Card.value || !p2Card.value)
      return "";

    const lines: string[] = [];

    const typeLabel: Record<string, string> = {
      attackMul: "Attack ×",
      defenseMul: "Defense ×",
      energyGainMul: "Energy Gain ×",
      energyMul: "Energy ×",
      attackAdd: "Attack +",
      defenseAdd: "Defense +",
      energyGainAdd: "Energy Gain +",
    };

    const entries: [string, PlayerState][] = [
      [p1Card.value.name, p1State.value],
      [p2Card.value.name, p2State.value],
    ];

    const turnsText = (t: number) => `${t} turn${t === 1 ? "" : "s"}`;

    for (const [name, state] of entries) {
      for (const e of state.activeEffects) {
        const label = typeLabel[e.type];
        if (label) {
          lines.push(
            `${name}: ${label}${e.value} for ${turnsText(e.turnsLeft)}.`,
          );
        }
      }

      if (state.poisonTurns > 0) {
        lines.push(
          `${name}: Poisoned ×${state.poisonMultiplier} for ${turnsText(
            state.poisonTurns,
          )}.`,
        );
      }

      if (state.preventedTurns > 0) {
        lines.push(
          `${name}: Cannot act for ${turnsText(state.preventedTurns)}.`,
        );
      }

      if (state.infiniteHealthTurns > 0) {
        lines.push(
          `${name}: Invulnerable for ${turnsText(state.infiniteHealthTurns)}.`,
        );
      }
    }

    return lines.join("\n");
  }

  function healthTint(hp: number, maxHp: number) {
    const ratio = hp / maxHp;
    const intensity = 1 - ratio;

    const saturate = 1 + intensity * 2;
    const brightness = 1 - intensity * 0.3;
    const sepia = intensity * 0.6;
    const hueRotate = -20 * intensity;

    return `
      sepia(${sepia})
      saturate(${saturate})
      brightness(${brightness})
      hue-rotate(${hueRotate}deg)
    `;
  }

  function createPlayerState(card: Card): PlayerState {
    return {
      hp: card.health,
      maxHp: card.health,

      moveEnergy: card.baseMoveEnergy,
      maxMoveEnergy: 100,
      moveEnergyGain: card.baseMoveEnergyGain,

      baseAttack: 1,
      baseDefense: card.defense,

      effectiveAttack: 1,
      effectiveDefense: card.defense,

      poisonTurns: 0,
      poisonMultiplier: 1,

      infiniteHealthTurns: 0,
      preventedTurns: 0,

      freshEffects: false,
      activeEffects: [],
    };
  }

  function tickEffects(stateRef: Ref<PlayerState | null>) {
    if (!stateRef.value) return;

    if (stateRef.value.freshEffects) {
      stateRef.value.freshEffects = false;
      return;
    }

    stateRef.value.activeEffects = stateRef.value.activeEffects
      .map((e) => ({ ...e, turnsLeft: e.turnsLeft - 1 }))
      .filter((e) => e.turnsLeft > 0);
  }

  function regenEnergyAndPoison(stateRef: Ref<PlayerState | null>) {
    if (!stateRef.value) return;

    const s = stateRef.value;

    s.moveEnergy = Math.min(s.maxMoveEnergy, s.moveEnergy + getEnergyGain(s));

    if (s.poisonTurns > 0) {
      if (s.infiniteHealthTurns <= 0)
        s.hp = Math.round(s.hp * s.poisonMultiplier);

      s.poisonTurns--;
      if (s.poisonTurns === 0) s.poisonMultiplier = 1;
    }

    if (s.infiniteHealthTurns > 0) {
      s.infiniteHealthTurns--;
      s.hp = 999999;
      s.maxHp = 999999;
    }
  }

  function calcDamage(
    attacker: PlayerState,
    move: CardMove["move"],
    defender: PlayerState,
  ): number {
    if (!move.damage) return 0;

    const atk = getEffectiveAttack(attacker);
    const def = getEffectiveDefense(defender);

    const reduction = def / 100;

    return Math.max(0, Math.round(move.damage * atk * (1 - reduction)));
  }

  function getStatModifiers(
    state: PlayerState,
    typeMap: {
      mul: string;
      add: string;
    },
  ) {
    const mul = state.activeEffects
      .filter((e) => e.type === typeMap.mul)
      .reduce((acc, e) => acc * e.value, 1);

    const add = state.activeEffects
      .filter((e) => e.type === typeMap.add)
      .reduce((acc, e) => acc + e.value, 0);

    return { mul, add };
  }

  function getEffectiveAttack(state: PlayerState) {
    const { mul, add } = getStatModifiers(state, {
      mul: "attackMul",
      add: "attackAdd",
    });

    return state.baseAttack * mul + add;
  }

  function getEffectiveDefense(state: PlayerState) {
    const { mul, add } = getStatModifiers(state, {
      mul: "defenseMul",
      add: "defenseAdd",
    });

    return state.baseDefense * mul + add;
  }

  function getEnergyGain(state: PlayerState) {
    const { mul, add } = getStatModifiers(state, {
      mul: "energyGainMul",
      add: "energyGainAdd",
    });

    return state.moveEnergyGain * mul + add;
  }

  function updateDisplayStats(stateRef: Ref<PlayerState | null>) {
    if (!stateRef.value) return;

    stateRef.value.effectiveAttack = getEffectiveAttack(stateRef.value);
    stateRef.value.effectiveDefense = getEffectiveDefense(stateRef.value);
  }

  function applyEffectsFromMove(
    move: CardMove["move"],
    selfRef: Ref<PlayerState | null>,
    enemyRef: Ref<PlayerState | null>,
  ) {
    if (!selfRef.value || !enemyRef.value) return;

    const s = selfRef.value;
    const e = enemyRef.value;

    if (move.domain?.componentName && move.domain.movePersistenceCount) {
      activeDomain.value = {
        componentName: move.domain.componentName,
        turnsLeft: move.domain.movePersistenceCount,
      };

      domainJustActivated.value = true;
    }

    const apply = (
      target: PlayerState,
      key: keyof CardMove["move"],
      type: any,
    ) => {
      const val = (move as any)[key];
      if (!val) return;

      target.activeEffects.push({
        type,
        value: val[0],
        turnsLeft: val[1],
      });

      target.freshEffects = true;
    };

    // self properties
    apply(s, "selfAttackMultiplier", "attackMul");
    apply(s, "selfDefenseMultiplier", "defenseMul");
    apply(s, "selfMoveEnergyGainMultiplier", "energyGainMul");
    apply(s, "selfMoveEnergyMultiplier", "energyMul");

    apply(s, "selfAttackScalarBoost", "attackAdd");
    apply(s, "selfDefenseScalarBoost", "defenseAdd");
    apply(s, "selfMoveEnergyGainScalarBoost", "energyGainAdd");

    if (move.selfPoison) {
      s.poisonTurns = move.selfPoison[1];
      s.poisonMultiplier = move.selfPoison[0];
    }

    if (move.selfPreventMove) s.preventedTurns = move.selfPreventMove;

    // enemy properties
    apply(e, "enemyAttackMultiplier", "attackMul");
    apply(e, "enemyDefenseMultiplier", "defenseMul");
    apply(e, "enemyMoveEnergyGainMultiplier", "energyGainMul");
    apply(e, "enemyMoveEnergyMultiplier", "energyMul");

    apply(e, "enemyAttackScalarBoost", "attackAdd");
    apply(e, "enemyDefenseScalarBoost", "defenseAdd");
    apply(e, "enemyMoveEnergyGainScalarBoost", "energyGainAdd");

    if (move.enemyPoison) {
      e.poisonTurns = move.enemyPoison[1];
      e.poisonMultiplier = move.enemyPoison[0];
    }

    if (move.enemyPreventMove) e.preventedTurns = move.enemyPreventMove;
  }

  function switchTurn() {
    const selfRef = currentPlayer.value === 1 ? p1State : p2State;
    const enemyRef = currentPlayer.value === 1 ? p2State : p1State;

    regenEnergyAndPoison(selfRef);
    tickEffects(selfRef);
    tickEffects(enemyRef);

    updateDisplayStats(selfRef);
    updateDisplayStats(enemyRef);

    if (activeDomain.value)
      if (!domainJustActivated.value) {
        activeDomain.value.turnsLeft--;
        if (activeDomain.value.turnsLeft <= 0) activeDomain.value = null;
      } else domainJustActivated.value = false;

    currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;

    skipToValidTurn();
  }

  function skipToValidTurn() {
    const state = currentPlayer.value === 1 ? p1State.value : p2State.value;
    if (!state) return;

    battleState.value = state.preventedTurns > 0 ? "prevented" : "player_turn";
  }

  function checkWin() {
    if (!p1State.value || !p2State.value) return false;

    if (p1State.value.hp <= 0) {
      winner.value = 2;
      battleState.value = "finished";
      activeDomain.value = null;
      return true;
    }

    if (p2State.value.hp <= 0) {
      winner.value = 1;
      battleState.value = "finished";
      activeDomain.value = null;
      return true;
    }

    return false;
  }

  function executeMove(move: CardMove["move"]) {
    if (!p1State.value || !p2State.value) return;

    const selfRef = currentPlayer.value === 1 ? p1State : p2State;
    const enemyRef = currentPlayer.value === 1 ? p2State : p1State;

    if (move.cost !== null)
      selfRef.value!.moveEnergy = Math.max(
        0,
        selfRef.value!.moveEnergy - move.cost,
      );

    if (move.damage) {
      const dmg = calcDamage(selfRef.value!, move, enemyRef.value!);
      enemyRef.value!.hp = Math.max(0, enemyRef.value!.hp - dmg);
    }

    applyEffectsFromMove(move, selfRef, enemyRef);

    updateDisplayStats(selfRef);
    updateDisplayStats(enemyRef);

    if (checkWin()) return;

    const message = buildEffectsMessage();

    if (message) {
      effectsMessage.value = message;
      battleState.value = "effects";
      pendingTurnSwitch = switchTurn;
      return;
    }

    switchTurn();
  }

  function initializeBattle() {
    currentPlayer.value = Math.random() < 0.5 ? 1 : 2;
    skipToValidTurn();
  }

  return {
    createPlayerState,
    executeMove,
    initializeBattle,
    switchTurn,
    skipToValidTurn,
    checkWin,
    tickEffects,
    regenEnergyAndPoison,
    healthTint,
    calcDamage,
    applyEffectsFromMove,
    onEffectsFinished,
  };
}
