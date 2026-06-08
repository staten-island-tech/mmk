<template>
  <div class="select-none relative flex flex-col w-full h-screen">
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
              winner === 1 ? 'border-game-p1-accent' : 'border-game-p2-accent'
            "
            @click="resetBattle"
          >
            Play Again
          </button>
        </div>
      </div>
    </Transition>

    <!-- Active Domain Overlay -->
 <component
  v-if="activeDomain && domainComponentMap[activeDomain.componentName]"
  :is="domainComponentMap[activeDomain.componentName]"
  class="absolute inset-0 z-30 pointer-events-none"
/>
<div class="absolute top-4 left-4 z-50 bg-black text-white text-xs p-2 font-mono">
  DEBUG INFO<br/>
  battleState: {{ battleState }}<br/>
  activeDomain: {{ activeDomain }}<br/>
  resolved: {{ activeDomain ? resolveComponent(activeDomain.componentName) : 'null' }}
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
    backgroundSize: '64px 64px'
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
      maskImage: 'linear-gradient(to bottom, transparent 0%, black 35%)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 35%)'
    }"
  />

      <!-- Player 2 card -->
      <div class="flex items-start justify-start p-5 z-10">
        <UiGameplayCardDisplay
          :card="p2Card"
          :state="p2State"
          :is-active="currentPlayer === 2 && battleState === 'player_turn'"
          playerLabel="Player 2"
          :accent="2"
        />
      </div>

      <!-- Player 1 card -->
      <div class="flex items-start justify-end p-5 z-10">
        <UiGameplayCardDisplay
          :card="p1Card"
          :state="p1State"
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
          'sprite-active': currentPlayer === 2 && battleState === 'player_turn',
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
          'sprite-active': currentPlayer === 1 && battleState === 'player_turn',
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
          :typing-speed-cps="28"
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
          :typing-speed-cps="35"
          @finished="onEffectsFinished"
        />
      </div>

      <div v-else-if="battleState === 'prevented'" class="h-full min-h-0">
        <UiGameplayDialogue
          :speaker="currentPlayer === 1 ? p1Card.name : p2Card.name"
          :dialogue-text="preventedMessage"
          :typing-speed-cps="30"
          @finished="onPreventedFinished"
        />
      </div>

      <!-- Move selection -->
      <div
        v-else-if="battleState === 'player_turn'"
        class="flex items-center gap-16 h-full"
      >
        <div>
          <p class="text-md tracking-widest font-alt uppercase">What will</p>
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
        <div class="overflow-y-auto flex-1 flex items-start pr-2 w-full h-full">
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
</template>

<script setup lang="ts">
import type { Card, CardMove } from "~/types/collection";
import { resolveComponent } from 'vue'
import { useNuxtApp } from '#app'


const domainComponentMap: Record<string, ReturnType<typeof resolveComponent>> = {
  DomainsMalice: resolveComponent('DomainsMalice'),
  DomainsWormhole: resolveComponent('DomainsWormhole'),
  DomainsStargate: resolveComponent('DomainsStargate'),
  DomainsSingularity: resolveComponent('DomainsSingularity'),
  DomainsEntropy: resolveComponent('DomainsEntropy'),
}
const isMaliceActive = computed(() =>
  activeDomain.value?.componentName === 'DomainsMalice'
)
const p1Card: Card = {
  id: 4,
  moves: [
    {
      id: 52,
      move: {
        id: 14,
        name: "Meow",
        cost: 0,
        damage: 20,
        selfDefenseMultiplier: null,
        selfAttackMultiplier: null,
        selfMoveEnergyMultiplier: null,
        selfMoveEnergyGainMultiplier: null,
        selfDesperationMultiplier: null,
        selfDefenseScalarBoost: null,
        selfAttackScalarBoost: null,
        selfMoveEnergyScalarBoost: null,
        selfMoveEnergyGainScalarBoost: null,
        selfPoison: null,
        selfPreventMove: null,
        selfCustomDialogue: null,
        enemyDefenseMultiplier: null,
        enemyAttackMultiplier: [0.95, 1],
        enemyMoveEnergyMultiplier: null,
        enemyMoveEnergyGainMultiplier: null,
        enemyDesperationMultiplier: [1.1, 2],
        enemyDefenseScalarBoost: null,
        enemyAttackScalarBoost: null,
        enemyMoveEnergyScalarBoost: null,
        enemyMoveEnergyGainScalarBoost: null,
        enemyDesperationScalarBoost: null,
        enemyPoison: null,
        enemyPreventMove: null,
        enemyCustomDialogue: null,
        domainComponentName: null,
        domainLength: null,
      },
      sprite: null,
    },
    {
      id: 53,
      move: {
        id: 15,
        name: "Imaginary Technique: Caffeine Spill",
        cost: 20,
        damage: 40,
        selfDefenseMultiplier: [0.9, 2],
        selfAttackMultiplier: [0.9, 2],
        selfMoveEnergyMultiplier: null,
        selfMoveEnergyGainMultiplier: [1.3, 2],
        selfDesperationMultiplier: null,
        selfDefenseScalarBoost: null,
        selfAttackScalarBoost: null,
        selfMoveEnergyScalarBoost: null,
        selfMoveEnergyGainScalarBoost: null,
        selfPoison: null,
        selfPreventMove: null,
        selfCustomDialogue:
          "Sorry, Frusci. I'm not even angry over you right now. I bear no grudges against anyone. it's just that the world feels so, so wonderful right now. \r\n$$BREAK$$\r\nThroughout the heavens and the Earth I alone am the honored one.\r\n$$Break$$\r\nThe merit of having a technique passed down for generations is having a user's manual. The demerit is that information about the technique is easily leaked. You were a member of the Programmer Clan, weren't you? That's why you know so much about the limitless technique.\r\n$$Break$$\r\nHowever, even in the Catboy Clan, only a scant few know about this. Take the amplified and the reversal. Then smash those two different expressions of infinity to create and push out imaginary mass.\r\n$$Break$$\r\nImaginary Technique: Caffeine Spill.",
        enemyDefenseMultiplier: null,
        enemyAttackMultiplier: null,
        enemyMoveEnergyMultiplier: null,
        enemyMoveEnergyGainMultiplier: null,
        enemyDesperationMultiplier: null,
        enemyDefenseScalarBoost: null,
        enemyAttackScalarBoost: null,
        enemyMoveEnergyScalarBoost: null,
        enemyMoveEnergyGainScalarBoost: null,
        enemyDesperationScalarBoost: null,
        enemyPoison: null,
        enemyPreventMove: null,
        enemyCustomDialogue: "",
        domainComponentName: null,
        domainLength: null,
      },
      sprite: null,
    },
    {
      id: 54,
      move: {
        id: 16,
        name: "Caffeine Boost",
        cost: 30,
        damage: 0,
        selfDefenseMultiplier: [2, 1],
        selfAttackMultiplier: [1.6, 2],
        selfMoveEnergyMultiplier: [1.6, 2],
        selfMoveEnergyGainMultiplier: null,
        selfDesperationMultiplier: null,
        selfDefenseScalarBoost: null,
        selfAttackScalarBoost: null,
        selfMoveEnergyScalarBoost: null,
        selfMoveEnergyGainScalarBoost: null,
        selfPoison: [0.95, 0],
        selfPreventMove: null,
        selfCustomDialogue: null,
        enemyDefenseMultiplier: null,
        enemyAttackMultiplier: null,
        enemyMoveEnergyMultiplier: null,
        enemyMoveEnergyGainMultiplier: null,
        enemyDesperationMultiplier: null,
        enemyDefenseScalarBoost: null,
        enemyAttackScalarBoost: null,
        enemyMoveEnergyScalarBoost: null,
        enemyMoveEnergyGainScalarBoost: null,
        enemyDesperationScalarBoost: null,
        enemyPoison: null,
        enemyPreventMove: null,
        enemyCustomDialogue: null,
        domainComponentName: null,
        domainLength: null,
      },
      sprite: null,
    },
    {
      id: 55,
      move: {
        id: 17,
        name: "Domain Expansion: Infinite Cat",
        cost: 90,
        damage: 90,
        selfDefenseMultiplier: null,
        selfAttackMultiplier: null,
        selfMoveEnergyMultiplier: null,
        selfMoveEnergyGainMultiplier: null,
        selfDesperationMultiplier: null,
        selfDefenseScalarBoost: null,
        selfAttackScalarBoost: null,
        selfMoveEnergyScalarBoost: null,
        selfMoveEnergyGainScalarBoost: null,
        selfPoison: null,
        selfPreventMove: null,
        selfCustomDialogue:
          "I wasn't worried about losing. Because you're weak. \r\n$$Break$$\r\nDomain Expansion: Infinite Cat",
        enemyDefenseMultiplier: null,
        enemyAttackMultiplier: null,
        enemyMoveEnergyMultiplier: null,
        enemyMoveEnergyGainMultiplier: null,
        enemyDesperationMultiplier: null,
        enemyDefenseScalarBoost: null,
        enemyAttackScalarBoost: null,
        enemyMoveEnergyScalarBoost: null,
        enemyMoveEnergyGainScalarBoost: null,
        enemyDesperationScalarBoost: null,
        enemyPoison: [0.8, 2],
        enemyPreventMove: 2,
        enemyCustomDialogue: "",
        domainComponentName: "DomainsStargate",
        domainLength: 3,
      },
      sprite: null,
    },
  ],
  rarity: {
    id: 13,
    weight: 9,
    name: "Special Grade",
    plateColor: "#ddd6fe",
    desperationConstant: 30,
  },
  name: "Michael Matiychenko",
  nickname: "Meowtiychenko",
  description:
    'Often referred to as "the strongest Michael of today," Meowtiychenko possesses the power of the Catfinity technique and the Six Cat Ears. He is also very hot, handsome, smart, cool, smart, funny, nonchalant, tall, buff, hot, cool and nonchalant. He also has the Six Cat Ears. Oh, and did I mention he also wears the Six Cat Ears?',
  defaultSprite:
    "https://idcpfzrbbasw.compat.objectstorage.us-ashburn-1.oraclecloud.com/mmk-media/collectibles/cards/sprites/85940a6c-ec41-4ceb-80bc-b7b5f8276bbc.png",
  audio: null,
  health: 130,
  defense: 30,
  baseMoveEnergy: 100,
  baseMoveEnergyGain: 10,
  desperation: -2,
};

const p2Card: Card = {
  id: 11,
  moves: [
    {
      id: 56,
      move: {
        id: 26,
        name: "Dismantle",
        cost: 0,
        damage: 15,
        selfDefenseMultiplier: null,
        selfAttackMultiplier: null,
        selfMoveEnergyMultiplier: null,
        selfMoveEnergyGainMultiplier: null,
        selfDesperationMultiplier: null,
        selfDefenseScalarBoost: null,
        selfAttackScalarBoost: null,
        selfMoveEnergyScalarBoost: null,
        selfMoveEnergyGainScalarBoost: null,
        selfPoison: null,
        selfPreventMove: null,
        selfCustomDialogue: "Brat.",
        enemyDefenseMultiplier: null,
        enemyAttackMultiplier: null,
        enemyMoveEnergyMultiplier: null,
        enemyMoveEnergyGainMultiplier: null,
        enemyDesperationMultiplier: null,
        enemyDefenseScalarBoost: null,
        enemyAttackScalarBoost: null,
        enemyMoveEnergyScalarBoost: null,
        enemyMoveEnergyGainScalarBoost: null,
        enemyDesperationScalarBoost: null,
        enemyPoison: null,
        enemyPreventMove: null,
        enemyCustomDialogue: "",
        domainComponentName: null,
        domainLength: null,
      },
      sprite: null,
    },
    {
      id: 57,
      move: {
        id: 27,
        name: "Eleven Darknesses Ability: Adapt",
        cost: 25,
        damage: 0,
        selfDefenseMultiplier: [1.3, 50],
        selfAttackMultiplier: null,
        selfMoveEnergyMultiplier: null,
        selfMoveEnergyGainMultiplier: null,
        selfDesperationMultiplier: null,
        selfDefenseScalarBoost: null,
        selfAttackScalarBoost: null,
        selfMoveEnergyScalarBoost: null,
        selfMoveEnergyGainScalarBoost: null,
        selfPoison: null,
        selfPreventMove: null,
        selfCustomDialogue:
          "Looks like we have a countdown. To when that smirk will be wiped off your face, that is.",
        enemyDefenseMultiplier: null,
        enemyAttackMultiplier: null,
        enemyMoveEnergyMultiplier: null,
        enemyMoveEnergyGainMultiplier: null,
        enemyDesperationMultiplier: null,
        enemyDefenseScalarBoost: null,
        enemyAttackScalarBoost: null,
        enemyMoveEnergyScalarBoost: null,
        enemyMoveEnergyGainScalarBoost: null,
        enemyDesperationScalarBoost: null,
        enemyPoison: null,
        enemyPreventMove: null,
        enemyCustomDialogue: "",
        domainComponentName: null,
        domainLength: null,
      },
      sprite: null,
    },
    {
      id: 58,
      move: {
        id: 28,
        name: "World Cutting Slash",
        cost: 20,
        damage: 40,
        selfDefenseMultiplier: null,
        selfAttackMultiplier: [0.8, 2],
        selfMoveEnergyMultiplier: null,
        selfMoveEnergyGainMultiplier: null,
        selfDesperationMultiplier: null,
        selfDefenseScalarBoost: null,
        selfAttackScalarBoost: null,
        selfMoveEnergyScalarBoost: null,
        selfMoveEnergyGainScalarBoost: null,
        selfPoison: null,
        selfPreventMove: 1,
        selfCustomDialogue:
          "In order to activate the broad-targeted, world-severing Dismantle, the same hand sign used for Malevolent HOS, Enmaten, is required. I am forced to impose a binding vow to the activation conditions for the proceeding turn, thus preventing my next move. Though you wouldn't be able to do anything enough to hurt me.",
        enemyDefenseMultiplier: null,
        enemyAttackMultiplier: null,
        enemyMoveEnergyMultiplier: null,
        enemyMoveEnergyGainMultiplier: null,
        enemyDesperationMultiplier: null,
        enemyDefenseScalarBoost: null,
        enemyAttackScalarBoost: null,
        enemyMoveEnergyScalarBoost: null,
        enemyMoveEnergyGainScalarBoost: null,
        enemyDesperationScalarBoost: null,
        enemyPoison: null,
        enemyPreventMove: null,
        enemyCustomDialogue: "",
        domainComponentName: null,
        domainLength: null,
      },
      sprite: null,
    },
    {
      id: 59,
      move: {
        id: 29,
        name: "HOS Nuke",
        cost: 75,
        damage: 100,
        selfDefenseMultiplier: null,
        selfAttackMultiplier: null,
        selfMoveEnergyMultiplier: null,
        selfMoveEnergyGainMultiplier: null,
        selfDesperationMultiplier: null,
        selfDefenseScalarBoost: null,
        selfAttackScalarBoost: null,
        selfMoveEnergyScalarBoost: null,
        selfMoveEnergyGainScalarBoost: null,
        selfPoison: null,
        selfPreventMove: 1,
        selfCustomDialogue:
          "You should have burnt everything you desired to a cinder. To reach the heights of Meowtiychenko and not to worry about your future or identity. But you lacked the hunger to take hold of your desires.\r\n$$Break$$\r\nHowever, you did manage to amuse me somewhat. I've fought students in the era of analog, and yet you still stand as one of the best programmers I fought.\r\n$$Break$$\r\nStand Proud. You are strong.",
        enemyDefenseMultiplier: null,
        enemyAttackMultiplier: null,
        enemyMoveEnergyMultiplier: null,
        enemyMoveEnergyGainMultiplier: null,
        enemyDesperationMultiplier: null,
        enemyDefenseScalarBoost: null,
        enemyAttackScalarBoost: null,
        enemyMoveEnergyScalarBoost: null,
        enemyMoveEnergyGainScalarBoost: null,
        enemyDesperationScalarBoost: null,
        enemyPoison: null,
        enemyPreventMove: null,
        enemyCustomDialogue: "pls dont nuke my HOS",
        domainComponentName: null,
        domainLength: null,
      },
      sprite: null,
    },
    {
      id: 64,
      move: {
        id: 30,
        name: "Domain Expansion: Malevolent HOS",
        cost: 75,
        damage: 59,
        selfDefenseMultiplier: null,
        selfAttackMultiplier: null,
        selfMoveEnergyMultiplier: null,
        selfMoveEnergyGainMultiplier: null,
        selfDesperationMultiplier: null,
        selfDefenseScalarBoost: null,
        selfAttackScalarBoost: null,
        selfMoveEnergyScalarBoost: null,
        selfMoveEnergyGainScalarBoost: null,
        selfPoison: null,
        selfPreventMove: null,
        selfCustomDialogue:
          "This is goodbye. You were born in an era without me and hailed for your strength. Yet you turned out to be painfully ordinary. \r\n$$Break$$\r\nDomain Expansion: Malevolent HOS",
        enemyDefenseMultiplier: null,
        enemyAttackMultiplier: null,
        enemyMoveEnergyMultiplier: null,
        enemyMoveEnergyGainMultiplier: null,
        enemyDesperationMultiplier: null,
        enemyDefenseScalarBoost: null,
        enemyAttackScalarBoost: null,
        enemyMoveEnergyScalarBoost: null,
        enemyMoveEnergyGainScalarBoost: null,
        enemyDesperationScalarBoost: null,
        enemyPoison: [0.7, 3],
        enemyPreventMove: null,
        enemyCustomDialogue: "",
        domainComponentName: "DomainsMalice",
        domainLength: 3,
      },
      sprite:
        "https://idcpfzrbbasw.compat.objectstorage.us-ashburn-1.oraclecloud.com/mmk-media/collectibles/moves/sprites/57910567-5289-4ece-ae06-acdd0c74b6d6.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1f3741ba2c50be9f0347d59b2bd62d1e915891eb%2F20260603%2Fus-ashburn-1%2Fs3%2Faws4_request&X-Amz-Date=20260603T002340Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=6f83541ee5e0d2c11e3b55dfc1d394d273afbb28dc5b83613511b16235f8eb51",
    },
  ],
  rarity: {
    id: 14,
    weight: 10,
    name: "King of HOS Bombs",
    plateColor: "#fecaca",
    desperationConstant: 40,
  },
  name: "Michael Whalen",
  nickname: "Evil Whalen",
  description:
    "Whalen is an ancient programmer from the analog era. He was considered the strongest of all time and eventually took the title of the King of Errors, forgoing his kind. He transformed into a bug in order to persist through time, and was eventually awakened by a vessel. He has now regained his true form. He has no goal, no allegiance, no ideal, and his strength is merely used for personal enjoyment. If he finds it amusing to kill someone, he will. Otherwise, he won't. His power isolated him, and the only one who could match his power was Meowtiychenko.",
  defaultSprite:
    "https://idcpfzrbbasw.compat.objectstorage.us-ashburn-1.oraclecloud.com/mmk-media/collectibles/cards/sprites/44a56e57-59f1-475d-90b0-17577bf854df.png",
  audio:
    "https://idcpfzrbbasw.compat.objectstorage.us-ashburn-1.oraclecloud.com/mmk-media/collectibles/cards/audio/783348fb-53bb-467b-b494-f80b22e917a6.mp3",
  health: 150,
  defense: 40,
  baseMoveEnergy: 100,
  baseMoveEnergyGain: 8,
  desperation: -5,
};

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

type BattleState =
  | "player_turn"
  | "dialogue"
  | "effects"
  | "prevented"
  | "finished";

const activeDomain = ref<ActiveDomain | null>(null);

function calcRarityDefenseBonus(a: Card, b: Card): [number, number] {
  if (a.rarity.weight === b.rarity.weight) return [0, 0];
  const bonus =
    3 *
    (Math.max(a.desperation, b.desperation) -
      Math.min(a.desperation, b.desperation));
  const isP1Lower = a.rarity.weight < b.rarity.weight;
  return isP1Lower ? [bonus, 0] : [0, bonus];
}

const [p1RarityBonus, p2RarityBonus] = calcRarityDefenseBonus(p1Card, p2Card);

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

const p1State = ref<PlayerState>(makePlayerState(p1Card, p1RarityBonus));
const p2State = ref<PlayerState>(makePlayerState(p2Card, p2RarityBonus));
const currentPlayer = ref<1 | 2>(Math.random() < 0.5 ? 1 : 2);
const battleState = ref<BattleState>("player_turn");
const winner = ref<1 | 2 | null>(null);

interface DialogueLine {
  speaker: string;
  text: string;
}
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
  currentDialogue.value = dialogueQueue.value[0];
}

function advanceDialogue() {
  dialogueQueue.value.shift();
  if (dialogueQueue.value.length > 0) {
    currentDialogue.value = dialogueQueue.value[0];
  } else {
    currentDialogue.value = null;
    const cb = afterDialogueCallback;
    afterDialogueCallback = null;
    cb?.();
  }
}
function onDialogueFinished() {
  advanceDialogue();
}

const effectsMessage = ref("");
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
  const stateRef = currentPlayer.value === 1 ? p1State : p2State;
  stateRef.value.preventedTurns = Math.max(
    0,
    stateRef.value.preventedTurns - 1,
  );
  regenEnergyAndPoison(stateRef);
  tickEffects(stateRef);
  switchTurn();
}

const currentMoves = computed<CardMove[]>(() =>
  currentPlayer.value === 1 ? p1Card.moves : p2Card.moves,
);

const currentPlayerState = computed<PlayerState>(() =>
  currentPlayer.value === 1 ? p1State.value : p2State.value,
);

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
  const s = selfRef.value;
  const e = enemyRef.value;

  // Domain handling
  if (move.domainComponentName && move.domainLength) {
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
  stateRef.value.activeEffects = stateRef.value.activeEffects
    .map((e) => ({ ...e, turnsLeft: e.turnsLeft - 1 }))
    .filter((e) => e.turnsLeft > 0);

  // Tick domain
  if (activeDomain.value) {
    activeDomain.value.turnsLeft--;
    if (activeDomain.value.turnsLeft <= 0) {
      activeDomain.value = null;
    }
  }
}

function regenEnergyAndPoison(stateRef: typeof p1State) {
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
    [p1Card.name, p1],
    [p2Card.name, p2],
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
  const state = currentPlayer.value === 1 ? p1State.value : p2State.value;
  battleState.value = state.preventedTurns > 0 ? "prevented" : "player_turn";
}

function switchTurn() {
  currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
  skipToValidTurn();
}

function selectMove(cardMove: CardMove) {
  if (battleState.value !== "player_turn") return;

  const selfRef = currentPlayer.value === 1 ? p1State : p2State;
  const enemyRef = currentPlayer.value === 1 ? p2State : p1State;
  const selfCard = currentPlayer.value === 1 ? p1Card : p2Card;
  const move = cardMove.move;

  if (move.cost !== null) {
    selfRef.value.moveEnergy = Math.max(
      0,
      selfRef.value.moveEnergy - move.cost,
    );
  }

  dialogueQueue.value = [];
  
  if (move.selfCustomDialogue)
    enqueueDialogue(selfCard.name, move.selfCustomDialogue);
  if (move.enemyCustomDialogue)
    enqueueDialogue(
      selfCard === p1Card ? p2Card.name : p1Card.name,
      move.enemyCustomDialogue,
    );

  const runMoveExecution = () => {
    let jackpotHit = false;
    if (move.id === 34 && Math.floor(Math.random() * 239) === 0) {
      jackpotHit = true;
      selfRef.value.hp = 999999;
      selfRef.value.maxHp = 999999;
      selfRef.value.infiniteHealthTurns = 10;
    }

    if (move.damage) {
      const dmg = calcDamage(selfRef.value, move, enemyRef.value);
      enemyRef.value.hp = Math.max(0, enemyRef.value.hp - dmg);
    }

    applyEffectsFromMove(move, selfRef, enemyRef);

    if (selfRef.value.hp <= 0) {
      winner.value = currentPlayer.value === 1 ? 2 : 1;
      battleState.value = "finished";
      return;
    }

    if (enemyRef.value.hp <= 0) {
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
      enqueueDialogue(selfCard.name, "HOLD UP, WAIT, I JUST HIT THE JACKPOT");
      startDialogueQueue(next);
    };

    const msg = buildEffectsMessage(p1State.value, p2State.value);
    afterJackpot(() => {
      if (msg) showEffects(msg, () => switchTurn());
      else switchTurn();
    });
  };

  if (dialogueQueue.value.length > 0) startDialogueQueue(runMoveExecution);
  else runMoveExecution();
}

watch(battleState, (val) => {
  if (val === "prevented") {
    const name = currentPlayer.value === 1 ? p1Card.name : p2Card.name;
    preventedMessage.value = `${name} is unable to move this turn.`;
  }
});

function resetBattle() {
  p1State.value = makePlayerState(p1Card, p1RarityBonus);
  p2State.value = makePlayerState(p2Card, p2RarityBonus);
  currentPlayer.value = Math.random() < 0.5 ? 1 : 2;
  winner.value = null;
  dialogueQueue.value = [];
  currentDialogue.value = null;
  effectsMessage.value = "";
  activeDomain.value = null;
  skipToValidTurn();
}

skipToValidTurn();

const audioRef = ref<HTMLAudioElement | null>(null);

function resolveAudioSrc(): string | null {
  const p1Audio = p1Card.audio;
  const p2Audio = p2Card.audio;

  if (p1Audio && p2Audio) {
    const useP1 = p1Card.rarity.weight >= p2Card.rarity.weight;
    return useP1 ? p1Audio : p2Audio;
  }
  if (p1Audio) return p1Audio;
  if (p2Audio) return p2Audio;
  return null;
}

onMounted(() => {
  const src = resolveAudioSrc();
  if (!src) return;

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
});

onBeforeUnmount(() => {
  audioRef.value?.pause();
  audioRef.value = null;
});
</script>

<style>
.win-enter-active,
.win-leave-active {
  transition: opacity 0.5s ease;
}

.win-enter-from,
.win-leave-to {
  opacity: 0;
}
</style>