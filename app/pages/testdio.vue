<template>
  <div class="select-none relative flex flex-col w-full h-screen">
    <Transition name="fade-battle" mode="out-in">
      <div
        v-if="!p1Card || !p2Card"
        key="loading"
        class="flex flex-col gap-4 justify-center items-center h-full text-blue-200"
      >
        <UiBackgroundDomain class="-z-10 brightness-75" />
        <Icon name="lucide:loader-circle" class="w-16 h-16 animate-spin" />
        <h2 class="text-3xl md:text-4xl tracking-wider">
          Loading battle<span class="dots" />
        </h2>
      </div>

      <div v-else key="battle" class="relative w-full h-full flex flex-col">
        <Transition name="win">
          <div
            v-if="battleState === 'finished'"
            class="z-40 absolute inset-0 flex flex-col justify-center items-center bg-black/70 backdrop-blur-md"
          >
            <div
              class="flex flex-col items-center gap-6 p-12 w-full border-y-8 border-double ring-y-4 ring-red-300 ring-inset"
              :class="
                winner === 1
                  ? 'border-game-p1-accent text-game-p1-accent'
                  : 'border-game-p2-accent text-game-p2-accent'
              "
            >
              <p class="text-2xl tracking-wide font-alt font-bold uppercase">
                Victory
              </p>
              <h1 class="text-5xl tracking-widest font-display uppercase">
                {{ winner === 1 ? p1Card.name : p2Card.name }}
              </h1>
              <p class="text-xl tracking-wide font-alt font-semibold uppercase">
                {{ winner === 1 ? "Player 1" : "Player 2" }} wins
              </p>
              <button
                class="mt-4 px-8 py-3 border-2 font-mono text-xs tracking-[0.4em] uppercase hover:bg-white/10 transition-colors"
                :class="
                  winner === 1
                    ? 'border-game-p1-accent'
                    : 'border-game-p2-accent'
                "
                @click="resetBattle"
              >
                Play Again
              </button>
            </div>
          </div>
        </Transition>

        <!-- Domain overlay -->
        <component
          v-if="activeDomain && domainComponentMap[activeDomain.componentName]"
          :is="domainComponentMap[activeDomain.componentName]"
          class="absolute inset-0 z-30 pointer-events-none"
        />
        <div
          class="flex flex-col gap-2 absolute top-4 left-4 z-50 bg-black text-white text-xs p-2 font-mono"
        >
          <p>DEBUG INFO</p>
          <p>battleState: {{ battleState }}</p>
          <p>activeDomain: {{ activeDomain }}</p>
          <p>resolved:</p>
          <p>
            {{
              activeDomain
                ? resolveComponent(activeDomain.componentName)
                : "null"
            }}
          </p>
        </div>

        <!-- Battlefield -->
        <div
          class="overflow-hidden relative grid h-3/4 grid-cols-2 grid-rows-2 p-12 transition-colors duration-700"
          :class="isMaliceActive ? '' : 'bg-slate-100'"
          :style="{
            backgroundColor: isMaliceActive ? '#1a0000' : undefined,
            backgroundImage: isMaliceActive
              ? 'linear-gradient(#3d0a0a 1px, transparent 1px), linear-gradient(90deg, #3d0a0a 1px, transparent 1px)'
              : 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }"
        >
          <!-- Ground -->
          <div
            class="absolute bottom-0 left-1/2 w-[300%] h-96 origin-bottom transition-colors duration-700"
            :class="isMaliceActive ? '' : 'bg-slate-200'"
            :style="{
              transform: 'translateX(-50%) perspective(350px) rotateX(45deg)',
              backgroundColor: isMaliceActive ? '#2a0505' : undefined,
              backgroundImage: isMaliceActive
                ? 'linear-gradient(#4a1010 1px, transparent 1px), linear-gradient(90deg, #4a1010 1px, transparent 1px)'
                : 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
              backgroundSize: '8rem 8rem',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, black 35%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, black 35%)',
            }"
          />

          <!-- Player 2 card -->
          <div class="flex items-start justify-start p-5 z-10">
            <UiGameplayCardDisplay
              :card="p2Card"
              :state="p2State!"
              :is-active="currentPlayer === 2 && battleState === 'player_turn'"
              playerLabel="Player 2"
              :accent="2"
            />
          </div>

          <!-- Player 1 card -->
          <div class="flex items-start justify-end p-5 z-10">
            <UiGameplayCardDisplay
              :card="p1Card"
              :state="p1State!"
              :is-active="currentPlayer === 1 && battleState === 'player_turn'"
              playerLabel="Player 1"
              :accent="1"
              :flip="true"
            />
          </div>

          <!-- Player 2 sprite -->
          <div
            class="flex items-end justify-start pl-32 z-10"
            :class="{
              'sprite-active':
                currentPlayer === 2 && battleState === 'player_turn',
            }"
          >
            <div class="relative flex flex-col-reverse items-center">
              <img
                :src="p2Card.defaultSprite"
                class="w-48 h-48 object-contain transition-all duration-300"
                :style="{
                  filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))',
                }"
              />
              <div class="absolute w-24 h-8 rounded-full bg-black/30 blur-md" />
            </div>
          </div>

          <!-- Player 1 sprite -->
          <div
            class="flex items-end justify-end pr-32 z-10"
            :class="{
              'sprite-active':
                currentPlayer === 1 && battleState === 'player_turn',
            }"
          >
            <div class="relative flex flex-col-reverse items-center">
              <img
                :src="p1Card.defaultSprite"
                class="w-48 h-48 object-contain scale-x-[-1] transition-all duration-300"
                :style="{
                  filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))',
                }"
              />
              <div class="absolute w-24 h-8 rounded-full bg-black/30 blur-md" />
            </div>
          </div>
        </div>

        <!-- Bottom panel -->
        <UiCardSimple class="p-8 w-full h-1/4 !max-w-full">
          <div
            v-if="battleState === 'dialogue' && currentDialogue"
            class="h-full min-h-0"
          >
            <UiGameplayDialogue
              :speaker="currentDialogue.speaker"
              :dialogue-text="currentDialogue.text"
              :typing-speed-cps="50"
              @finished="onDialogueFinished"
            />
          </div>

          <div
            v-else-if="battleState === 'effects' && effectsMessage"
            class="h-full min-h-0"
          >
            <UiGameplayDialogue
              speaker="Battle Log"
              :dialogue-text="effectsMessage"
              :typing-speed-cps="60"
              @finished="onEffectsFinished"
            />
          </div>

          <div v-else-if="battleState === 'prevented'" class="h-full min-h-0">
            <UiGameplayDialogue
              :speaker="currentPlayer === 1 ? p1Card.name : p2Card.name"
              :dialogue-text="preventedMessage"
              :typing-speed-cps="70"
              @finished="onPreventedFinished"
            />
          </div>

          <!-- Move selection -->
          <div
            v-else-if="battleState === 'player_turn'"
            class="flex items-center gap-16 h-full"
          >
            <div>
              <p class="text-md tracking-widest font-alt uppercase">
                What will
              </p>
              <p
                class="text-xl leading-tight"
                :class="
                  currentPlayer === 1
                    ? 'text-game-p1-accent'
                    : 'text-game-p2-accent'
                "
              >
                {{ currentPlayer === 1 ? p1Card.name : p2Card.name }}
              </p>
              <p class="text-md tracking-widest font-alt uppercase">do?</p>
            </div>

            <!-- Move list -->
            <div
              class="overflow-y-auto flex-1 flex items-start pr-2 w-full h-full"
            >
              <div class="grid grid-cols-3 auto-rows-fr gap-4 w-full">
                <UiGameplayMoveButton
                  v-for="move in currentMoves"
                  :key="move.id"
                  :move="move"
                  :current-energy="currentPlayerState.moveEnergy"
                  @select="selectMove"
                  class="w-full h-full"
                />
              </div>
            </div>
          </div>

          <!-- Idle -->
          <div v-else class="idle-panel">
            <span class="text-xs tracking-wide">Idle</span>
          </div>
        </UiCardSimple>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Card, CardMove } from "~/types/collection";

const config = useRuntimeConfig();

const p1Card = ref<Card | null>(null);
const p2Card = ref<Card | null>(null);
const isLoading = ref(true);

interface ActiveEffect {
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

interface PlayerState {
  hp: number;
  maxHp: number;
  moveEnergy: number;
  maxMoveEnergy: number;
  moveEnergyGain: number;
  defense: number;
  attack: number;
  activeEffects: ActiveEffect[];
  preventedTurns: number;
  poisonTurns: number;
  poisonMultiplier: number;
  infiniteHealthTurns: number;
}

interface ActiveDomain {
  componentName: string;
  turnsLeft: number;
}

interface DialogueLine {
  speaker: string;
  text: string;
}

type BattleState =
  | "player_turn"
  | "dialogue"
  | "effects"
  | "prevented"
  | "finished";

const domainComponentMap: Record<
  string,
  ReturnType<typeof resolveComponent>
> = {
  DomainsMalice: resolveComponent("DomainsMalice"),
  DomainsWormhole: resolveComponent("DomainsWormhole"),
  DomainsStargate: resolveComponent("DomainsStargate"),
  DomainsSingularity: resolveComponent("DomainsSingularity"),
  DomainsEntropy: resolveComponent("DomainsEntropy"),
};

const isMaliceActive = computed( // this one is not WebGL-based, so it has some exceptions
  () => activeDomain.value?.componentName === "DomainsMalice",
);

const currentMoves = computed<CardMove[]>(() => {
  if (!p1Card.value || !p2Card.value) return [];
  return currentPlayer.value === 1 ? p1Card.value.moves : p2Card.value.moves;
});

const currentPlayerState = computed<PlayerState>(() => {
  return currentPlayer.value === 1 ? p1State.value! : p2State.value!;
});

function calcRarityDefenseBonus(a: Card, b: Card): [number, number] {
  if (a.rarity.weight === b.rarity.weight) return [0, 0];
  const bonus =
    3 *
    (Math.max(a.desperation, b.desperation) -
      Math.min(a.desperation, b.desperation));
  const isP1Lower = a.rarity.weight < b.rarity.weight;
  return isP1Lower ? [bonus, 0] : [0, bonus];
}

function makePlayerState(card: Card, rarityBonus: number): PlayerState {
  return {
    hp: card.health,
    maxHp: card.health,
    moveEnergy: card.baseMoveEnergy,
    maxMoveEnergy: 100,
    moveEnergyGain: card.baseMoveEnergyGain,
    defense: card.defense + rarityBonus,
    attack: 1.0,
    activeEffects: [],
    preventedTurns: 0,
    poisonTurns: 0,
    poisonMultiplier: 1,
    infiniteHealthTurns: 0,
  };
}

function initializeBattle() {
  if (!p1Card.value || !p2Card.value) return;

  const [p1RarityBonus, p2RarityBonus] = calcRarityDefenseBonus(
    p1Card.value,
    p2Card.value,
  );

  p1State.value = makePlayerState(p1Card.value, p1RarityBonus);
  p2State.value = makePlayerState(p2Card.value, p2RarityBonus);

  currentPlayer.value = Math.random() < 0.5 ? 1 : 2;
  skipToValidTurn();
  isLoading.value = false;
}

const p1State = ref<PlayerState | null>(null);
const p2State = ref<PlayerState | null>(null);
const activeDomain = ref<ActiveDomain | null>(null);
const currentPlayer = ref<1 | 2>(1);
const battleState = ref<BattleState>("player_turn");
const winner = ref<1 | 2 | null>(null);

const dialogueQueue = ref<DialogueLine[]>([]);
const currentDialogue = ref<DialogueLine | null>(null);
let afterDialogueCallback: (() => void) | null = null;

function enqueueDialogue(speaker: string, rawText: string) {
  const parts = rawText.split(/\$\$BREAK\$\$/i);
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed) dialogueQueue.value.push({ speaker, text: trimmed });
  }
}

function startDialogueQueue(onDone: () => void) {
  afterDialogueCallback = onDone;
  if (dialogueQueue.value.length === 0) return onDone();
  battleState.value = "dialogue";
  currentDialogue.value = dialogueQueue.value[0]!;
}

function advanceDialogue() {
  dialogueQueue.value.shift();
  if (dialogueQueue.value.length > 0)
    currentDialogue.value = dialogueQueue.value[0]!;
  else {
    currentDialogue.value = null;
    const cb = afterDialogueCallback;
    afterDialogueCallback = null;
    cb?.();
  }
}

function onDialogueFinished() {
  advanceDialogue();
}

const effectsMessage = ref<string>("");
let afterEffectsCallback: (() => void) | null = null;

function showEffects(message: string, onDone: () => void) {
  effectsMessage.value = message;
  battleState.value = "effects";
  afterEffectsCallback = onDone;
}

function onEffectsFinished() {
  effectsMessage.value = "";
  battleState.value = "player_turn";
  afterEffectsCallback?.();
  afterEffectsCallback = null;
}

const preventedMessage = ref("");

function onPreventedFinished() {
  if (!p1State.value || !p2State.value) return;

  const stateRef = currentPlayer.value === 1 ? p1State : p2State;
  stateRef.value!.preventedTurns = Math.max(
    0,
    stateRef.value!.preventedTurns - 1,
  );

  regenEnergyAndPoison(stateRef);
  tickEffects(stateRef);
  switchTurn();
}

function getEffectiveStat(
  state: PlayerState,
  type: "attack" | "defense" | "energyGain",
): number {
  const mulType =
    type === "attack"
      ? "attackMul"
      : type === "defense"
        ? "defenseMul"
        : "energyGainMul";
  const addType =
    type === "attack"
      ? "attackAdd"
      : type === "defense"
        ? "defenseAdd"
        : "energyGainAdd";

  let mul = 1.0;
  let add = 0;

  for (const e of state.activeEffects) {
    if (e.type === mulType) mul *= e.value;
    if (e.type === addType) add += e.value;
  }

  if (type === "attack") return mul + add;
  const base = type === "defense" ? state.defense : state.moveEnergyGain;

  return base * mul + add;
}

function calcDamage(
  attacker: PlayerState,
  move: { damage: number | null },
  defender: PlayerState,
): number {
  if (!move.damage) return 0;

  const atkMul = getEffectiveStat(attacker, "attack");
  const atkAdd = attacker.activeEffects
    .filter((e) => e.type === "attackAdd")
    .reduce((s, e) => s + e.value, 0);
  const def = getEffectiveStat(defender, "defense");

  return Math.max(
    0,
    Math.round((move.damage * atkMul + atkAdd) * (1 - def / 100)),
  );
}

function applyEffectsFromMove(
  move: CardMove["move"],
  selfRef: typeof p1State,
  enemyRef: typeof p2State,
) {
  if (!selfRef.value || !enemyRef.value) return;
  const s = selfRef.value;
  const e = enemyRef.value;

  if (move.domainComponentName && move.domainLength) {
    // change active domain
    activeDomain.value = {
      componentName: move.domainComponentName,
      turnsLeft: move.domainLength,
    };
  }

  if (move.selfAttackMultiplier)
    s.activeEffects.push({
      type: "attackMul",
      value: move.selfAttackMultiplier[0],
      turnsLeft: move.selfAttackMultiplier[1],
    });
  if (move.selfDefenseMultiplier)
    s.activeEffects.push({
      type: "defenseMul",
      value: move.selfDefenseMultiplier[0],
      turnsLeft: move.selfDefenseMultiplier[1],
    });
  if (move.selfMoveEnergyGainMultiplier)
    s.activeEffects.push({
      type: "energyGainMul",
      value: move.selfMoveEnergyGainMultiplier[0],
      turnsLeft: move.selfMoveEnergyGainMultiplier[1],
    });
  if (move.selfMoveEnergyMultiplier)
    s.activeEffects.push({
      type: "energyMul",
      value: move.selfMoveEnergyMultiplier[0],
      turnsLeft: move.selfMoveEnergyMultiplier[1],
    });
  if (move.selfAttackScalarBoost)
    s.activeEffects.push({
      type: "attackAdd",
      value: move.selfAttackScalarBoost[0],
      turnsLeft: move.selfAttackScalarBoost[1],
    });
  if (move.selfDefenseScalarBoost)
    s.activeEffects.push({
      type: "defenseAdd",
      value: move.selfDefenseScalarBoost[0],
      turnsLeft: move.selfDefenseScalarBoost[1],
    });
  if (move.selfMoveEnergyGainScalarBoost)
    s.activeEffects.push({
      type: "energyGainAdd",
      value: move.selfMoveEnergyGainScalarBoost[0],
      turnsLeft: move.selfMoveEnergyGainScalarBoost[1],
    });
  if (move.selfPoison) {
    s.poisonTurns = move.selfPoison[1];
    s.poisonMultiplier = move.selfPoison[0];
  }
  if (move.selfPreventMove) s.preventedTurns = move.selfPreventMove;

  if (move.enemyAttackMultiplier)
    e.activeEffects.push({
      type: "attackMul",
      value: move.enemyAttackMultiplier[0],
      turnsLeft: move.enemyAttackMultiplier[1],
    });
  if (move.enemyDefenseMultiplier)
    e.activeEffects.push({
      type: "defenseMul",
      value: move.enemyDefenseMultiplier[0],
      turnsLeft: move.enemyDefenseMultiplier[1],
    });
  if (move.enemyMoveEnergyGainMultiplier)
    e.activeEffects.push({
      type: "energyGainMul",
      value: move.enemyMoveEnergyGainMultiplier[0],
      turnsLeft: move.enemyMoveEnergyGainMultiplier[1],
    });
  if (move.enemyMoveEnergyMultiplier)
    e.activeEffects.push({
      type: "energyMul",
      value: move.enemyMoveEnergyMultiplier[0],
      turnsLeft: move.enemyMoveEnergyMultiplier[1],
    });
  if (move.enemyAttackScalarBoost)
    e.activeEffects.push({
      type: "attackAdd",
      value: move.enemyAttackScalarBoost[0],
      turnsLeft: move.enemyAttackScalarBoost[1],
    });
  if (move.enemyDefenseScalarBoost)
    e.activeEffects.push({
      type: "defenseAdd",
      value: move.enemyDefenseScalarBoost[0],
      turnsLeft: move.enemyDefenseScalarBoost[1],
    });
  if (move.enemyMoveEnergyGainScalarBoost)
    e.activeEffects.push({
      type: "energyGainAdd",
      value: move.enemyMoveEnergyGainScalarBoost[0],
      turnsLeft: move.enemyMoveEnergyGainScalarBoost[1],
    });
  if (move.enemyPoison) {
    e.poisonTurns = move.enemyPoison[1];
    e.poisonMultiplier = move.enemyPoison[0];
  }
  if (move.enemyPreventMove) e.preventedTurns = move.enemyPreventMove;
}

function tickEffects(stateRef: typeof p1State) {
  if (!stateRef.value) return;

  stateRef.value.activeEffects = stateRef.value.activeEffects
    .map((e) => ({ ...e, turnsLeft: e.turnsLeft - 1 }))
    .filter((e) => e.turnsLeft > 0);

  if (activeDomain.value) {
    activeDomain.value.turnsLeft--;
    if (activeDomain.value.turnsLeft <= 0) activeDomain.value = null;
  }
}

function regenEnergyAndPoison(stateRef: typeof p1State) {
  if (!stateRef.value) return;

  const s = stateRef.value;
  s.moveEnergy = Math.min(
    s.maxMoveEnergy,
    s.moveEnergy + getEffectiveStat(s, "energyGain"),
  );

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

function buildEffectsMessage(p1: PlayerState, p2: PlayerState): string {
  if (!p1Card.value || !p2Card.value) return "";

  const lines: string[] = [];
  const typeLabel: Record<string, string> = {
    attackMul: "ATK ×",
    defenseMul: "DEF ×",
    energyGainMul: "Energy Gain ×",
    energyMul: "Energy ×",
    attackAdd: "ATK +",
    defenseAdd: "DEF +",
    energyGainAdd: "Energy Gain +",
    energyAdd: "Energy +",
  };

  for (const [label, s] of [
    [p1Card.value.name, p1],
    [p2Card.value.name, p2],
  ] as [string, PlayerState][]) {
    for (const e of s.activeEffects) {
      const tl = typeLabel[e.type];
      if (tl)
        lines.push(
          `${label}: ${tl}${e.value} for ${e.turnsLeft} more turn${e.turnsLeft !== 1 ? "s" : ""}`,
        );
    }

    if (s.poisonTurns > 0)
      lines.push(
        `${label}: Poisoned (×${s.poisonMultiplier}) for ${s.poisonTurns} more turn${s.poisonTurns !== 1 ? "s" : ""}`,
      );
    if (s.preventedTurns > 0)
      lines.push(
        `${label}: Cannot move for ${s.preventedTurns} more turn${s.preventedTurns !== 1 ? "s" : ""}`,
      );
    if (s.infiniteHealthTurns > 0)
      lines.push(
        `${label}: INFINITE HEALTH for ${s.infiniteHealthTurns} more turn${s.infiniteHealthTurns !== 1 ? "s" : ""}`,
      );
  }

  return lines.join("\n");
}

function skipToValidTurn() {
  if (!p1State.value || !p2State.value) return;
  const state = currentPlayer.value === 1 ? p1State.value : p2State.value;
  battleState.value = state.preventedTurns > 0 ? "prevented" : "player_turn";
}

function switchTurn() {
  currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
  skipToValidTurn();
}

function selectMove(cardMove: CardMove) {
  if (
    battleState.value !== "player_turn" ||
    !p1State.value ||
    !p2State.value ||
    !p1Card.value ||
    !p2Card.value
  )
    return;

  const selfRef = currentPlayer.value === 1 ? p1State : p2State;
  const enemyRef = currentPlayer.value === 1 ? p2State : p1State;
  const selfCard = currentPlayer.value === 1 ? p1Card : p2Card;
  const move = cardMove.move;

  if (move.cost !== null)
    selfRef.value!.moveEnergy = Math.max(
      0,
      selfRef.value!.moveEnergy - move.cost,
    );

  dialogueQueue.value = [];
  if (move.selfCustomDialogue)
    enqueueDialogue(selfCard.value!.name, move.selfCustomDialogue);
  if (move.enemyCustomDialogue)
    enqueueDialogue(
      selfCard === p1Card ? p2Card.value!.name : p1Card.value!.name,
      move.enemyCustomDialogue,
    );

  const runMoveExecution = () => {
    let jackpotHit = false;
    if (move.id === 34 && Math.floor(Math.random() * 239) === 0) {
      jackpotHit = true;
      selfRef.value!.hp = 999999;
      selfRef.value!.maxHp = 999999;
      selfRef.value!.infiniteHealthTurns = 10;
    }

    if (move.damage) {
      const dmg = calcDamage(selfRef.value!, move, enemyRef.value!);
      enemyRef.value!.hp = Math.max(0, enemyRef.value!.hp - dmg);
    }

    applyEffectsFromMove(move, selfRef, enemyRef);

    if (selfRef.value!.hp <= 0) {
      winner.value = currentPlayer.value === 1 ? 2 : 1;
      battleState.value = "finished";
      return;
    }
    if (enemyRef.value!.hp <= 0) {
      winner.value = currentPlayer.value;
      battleState.value = "finished";
      return;
    }

    regenEnergyAndPoison(selfRef);
    tickEffects(selfRef);

    const afterJackpot = (next: () => void) => {
      if (!jackpotHit) {
        next();
        return;
      }
      dialogueQueue.value = [];
      enqueueDialogue(
        selfCard.value!.name,
        "HOLD UP. WAIT, I JUST HIT THE JACKPOT.",
      );
      startDialogueQueue(next);
    };

    const msg = buildEffectsMessage(p1State.value!, p2State.value!);
    afterJackpot(() => {
      if (msg) showEffects(msg, () => switchTurn());
      else switchTurn();
    });
  };

  if (dialogueQueue.value.length > 0) startDialogueQueue(runMoveExecution);
  else runMoveExecution();
}

watch(battleState, (val) => {
  if (val === "prevented" && p1Card.value && p2Card.value) {
    const name =
      currentPlayer.value === 1 ? p1Card.value.name : p2Card.value.name;
    preventedMessage.value = `${name} is unable to move this turn.`;
  }
});

function resetBattle() {
  if (p1Card.value && p2Card.value) {
    initializeBattle();
    winner.value = null;
    dialogueQueue.value = [];
    currentDialogue.value = null;
    effectsMessage.value = "";
    activeDomain.value = null;
  }
}

const audioRef = ref<HTMLAudioElement | null>(null);

function resolveAudioSrc(): string | null {
  if (!p1Card.value || !p2Card.value) return null;

  const p1Audio = p1Card.value.audio;
  const p2Audio = p2Card.value.audio;

  if (p1Audio && p2Audio) {
    const useP1 = p1Card.value.rarity.weight >= p2Card.value.rarity.weight;
    return useP1 ? p1Audio : p2Audio;
  }

  if (p1Audio) return p1Audio;
  if (p2Audio) return p2Audio;

  return null;
}

onMounted(async () => {
  try {
    const [p1Data, p2Data] = await Promise.all([
      $fetch<Card[]>(`${config.public.mmkPanelApi}/cards`, {
        query: { name: "Michael Matiychenko" },
      }),
      $fetch<Card[]>(`${config.public.mmkPanelApi}/cards`, {
        query: { name: "Michael Whalen" },
      }),
    ]);

    p1Card.value = p1Data[0] || null;
    p2Card.value = p2Data[0] || null;

    if (p1Card.value && p2Card.value) {
      initializeBattle();
      const src = resolveAudioSrc();
      if (src) {
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(() => {
          const resume = () => {
            audio.play();
            window.removeEventListener("pointerdown", resume);
          };
          window.addEventListener("pointerdown", resume);
        });
        audioRef.value = audio;
      }
    }
  } catch (e) {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  audioRef.value?.pause();
  audioRef.value = null;
});
</script>

<style>
.fade-battle-enter-active,
.fade-battle-leave-active {
  transition: opacity 1s ease-out;
}

.fade-battle-enter-from,
.fade-battle-leave-to {
  opacity: 0;
}

.win-enter-active,
.win-leave-active {
  transition: opacity 0.5s ease;
}

.win-enter-from,
.win-leave-to {
  opacity: 0;
}

.dots::after {
  content: "";
  animation: dots 2s infinite;
}

@keyframes dots {
  0% {
    content: "";
  }

  25% {
    content: ".";
  }

  50% {
    content: "..";
  }

  75% {
    content: "...";
  }

  100% {
    content: "";
  }
}
</style>
