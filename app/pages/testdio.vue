<template>
  <div class="battle-root min-h-screen w-full flex flex-col overflow-hidden relative select-none">

    <!-- Scanline overlay -->
    <div class="scanlines pointer-events-none absolute inset-0 z-50" />

    <Transition name="win-fade">
      <div v-if="battleState === 'finished'" class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90">
        <div
          class="win-box flex flex-col items-center gap-6 p-12 border-double border-8"
          :class="winner === 0 ? 'border-p1-accent text-p1-accent' : 'border-p2-accent text-p2-accent'"
        >
          <p class="text-xs tracking-[0.5em] uppercase font-mono">Victory</p>
          <h1 class="text-5xl font-display uppercase tracking-widest">{{ winner === 0 ? p1Card.name : p2Card.name }}</h1>
          <p class="text-sm font-mono tracking-widest uppercase opacity-60">{{ winner === 0 ? 'Player 1' : 'Player 2' }} wins</p>
          <button
            class="mt-4 px-8 py-3 border-2 font-mono text-xs tracking-[0.4em] uppercase hover:bg-white/10 transition-colors"
            :class="winner === 0 ? 'border-p1-accent' : 'border-p2-accent'"
            @click="resetBattle"
          >Play Again</button>
        </div>
      </div>
    </Transition>

    <!-- handle domains -->
    <Transition name="domain-fade">
      <div v-if="activeDomain" class="pointer-events-none absolute inset-0 z-20">
        <DomainsSingulatory v-if="activeDomain === 'singulatory'" />
        <DomainsMalice v-else-if="activeDomain === 'malice'" />
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════════
         BATTLEFIELD
    ═══════════════════════════════════════════════ -->
    <div class="battlefield relative flex-1 min-h-0">

      <div class="ground absolute bottom-0 left-0 right-0" />

      <!-- P2 stat panel — top-left -->
      <div class="absolute top-5 left-6 z-10 w-56">
        <PokemonStatPanel
          :card="p2Card"
          :state="p2State"
          :is-active="currentPlayer === 1 && battleState === 'player_turn'"
          label="Player 2"
          accent="p2"
        />
      </div>

      <!-- P1 stat panel — bottom-right -->
      <div class="absolute bottom-20 right-6 z-10 w-56">
        <PokemonStatPanel
          :card="p1Card"
          :state="p1State"
          :is-active="currentPlayer === 0 && battleState === 'player_turn'"
          label="Player 1"
          accent="p1"
        />
      </div>

      <div
        class="sprite-enemy absolute z-10"
        :class="{ 'sprite-active': currentPlayer === 1 && battleState === 'player_turn' }"
      >
        <img
          :src="p2Card.defaultSprite"
          :alt="p2Card.name"
          class="sprite-img enemy-img"
          :class="{ 'hurt': p2State.hp < p2State.maxHp * 0.3 }"
        />
        <div class="sprite-shadow enemy-shadow" />
      </div>

      <!-- P1 sprite — player (bottom-left) -->
      <div
        class="sprite-player absolute z-10"
        :class="{ 'sprite-active': currentPlayer === 0 && battleState === 'player_turn' }"
      >
        <img
          :src="p1Card.defaultSprite"
          :alt="p1Card.name"
          class="sprite-img player-img"
          :class="{ 'hurt': p1State.hp < p1State.maxHp * 0.3 }"
          style="transform: scaleX(-1)"
        />
        <div class="sprite-shadow player-shadow" />
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════
         BOTTOM PANEL  (dialogue + moves)
    ═══════════════════════════════════════════════ -->
    <div class="bottom-panel flex flex-col z-30">

      <!-- Dialogue / effects / prevented -->
      <Transition name="dialogue-slide" mode="out-in">

        <div v-if="battleState === 'dialogue' && currentDialogue" key="dialogue" class="panel-slot">
          <UiGameplayDialogue
            :speaker="currentDialogue.speaker"
            :dialogue-text="currentDialogue.text"
            :typing-speed-cps="28"
            @finished="onDialogueFinished"
          />
        </div>

        <div v-else-if="battleState === 'effects' && effectsMessage" key="effects" class="panel-slot">
          <UiGameplayDialogue
            speaker="Battle Log"
            :dialogue-text="effectsMessage"
            :typing-speed-cps="35"
            @finished="onEffectsFinished"
          />
        </div>

        <div v-else-if="battleState === 'prevented'" key="prevented" class="panel-slot">
          <UiGameplayDialogue
            :speaker="currentPlayer === 0 ? p1Card.name : p2Card.name"
            :dialogue-text="preventedMessage"
            :typing-speed-cps="30"
            @finished="onPreventedFinished"
          />
        </div>

        <!-- MOVE SELECTION -->
        <div v-else-if="battleState === 'player_turn'" key="moves" class="panel-slot move-panel">
          <!-- Left: flavour -->
          <div class="move-panel-label">
            <p class="font-mono text-xs text-white/30 uppercase tracking-widest">What will</p>
            <p
              class="font-display text-lg leading-tight"
              :class="currentPlayer === 0 ? 'text-p1-accent' : 'text-p2-accent'"
            >{{ currentPlayer === 0 ? p1Card.name : p2Card.name }}</p>
            <p class="font-mono text-xs text-white/30 uppercase tracking-widest">do?</p>
          </div>
          <!-- Right: move grid -->
          <div class="move-grid">
            <UiGameplayMoveButton
              v-for="move in currentMoves"
              :key="move.id"
              :move="move"
              :current-energy="currentPlayerState.moveEnergy"
              :accent="currentPlayer === 0 ? 'p1' : 'p2'"
              @select="selectMove"
            />
          </div>
        </div>

        <!-- Idle / transitioning -->
        <div v-else key="idle" class="idle-panel">
          <span class="font-mono text-xs text-white/20 tracking-[0.4em] uppercase animate-pulse">— — —</span>
        </div>

      </Transition>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Card, CardMove } from '~/types/collections'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const p1Card: Card = {
  "id": 4,
  "moves": [
    {
      "id": 52,
      "move": {
        "id": 14,
        "name": "Meow",
        "cost": 0,
        "damage": 20,
        "selfDefenseMultiplier": null,
        "selfAttackMultiplier": null,
        "selfMoveEnergyMultiplier": null,
        "selfMoveEnergyGainMultiplier": null,
        "selfDesperationMultiplier": null,
        "selfDefenseScalarBoost": null,
        "selfAttackScalarBoost": null,
        "selfMoveEnergyScalarBoost": null,
        "selfMoveEnergyGainScalarBoost": null,
        "selfPoison": null,
        "selfPreventMove": null,
        "selfCustomDialogue": null,
        "enemyDefenseMultiplier": null,
        "enemyAttackMultiplier": [0.95, 1],
        "enemyMoveEnergyMultiplier": null,
        "enemyMoveEnergyGainMultiplier": null,
        "enemyDesperationMultiplier": [1.1, 2],
        "enemyDefenseScalarBoost": null,
        "enemyAttackScalarBoost": null,
        "enemyMoveEnergyScalarBoost": null,
        "enemyMoveEnergyGainScalarBoost": null,
        "enemyDesperationScalarBoost": null,
        "enemyPoison": null,
        "enemyPreventMove": null,
        "enemyCustomDialogue": null
      },
      "sprite": null,
      "card": 4
    },
    {
      "id": 53,
      "move": {
        "id": 15,
        "name": "Imaginary Technique: Caffeine Spill",
        "cost": 20,
        "damage": 40,
        "selfDefenseMultiplier": [0.9, 2],
        "selfAttackMultiplier": [0.9, 2],
        "selfMoveEnergyMultiplier": null,
        "selfMoveEnergyGainMultiplier": [1.3, 2],
        "selfDesperationMultiplier": null,
        "selfDefenseScalarBoost": null,
        "selfAttackScalarBoost": null,
        "selfMoveEnergyScalarBoost": null,
        "selfMoveEnergyGainScalarBoost": null,
        "selfPoison": null,
        "selfPreventMove": null,
        "selfCustomDialogue": "Sorry, Frusci. I'm not even angry over you right now. I bear no grudges against anyone. it's just that the world feels so, so wonderful right now. \r\n$$BREAK$$\r\nThroughout the heavens and the Earth I alone am the honored one.\r\n$$BREAK$$\r\nThe merit of having a technique passed down for generations is having a user's manual. The demerit is that information about the technique is easily leaked. You were a member of the Programmer Clan, weren't you? That's why you know so much about the limitless technique.\r\n$$BREAK$$\r\nHowever, even in the Catboy Clan, only a scant few know about this. Take the amplified and the reversal. Then smash those two different expressions of infinity to create and push out imaginary mass.\r\n$$BREAK$$\r\nImaginary Technique: Caffeine Spill.",
        "enemyDefenseMultiplier": null,
        "enemyAttackMultiplier": null,
        "enemyMoveEnergyMultiplier": null,
        "enemyMoveEnergyGainMultiplier": null,
        "enemyDesperationMultiplier": null,
        "enemyDefenseScalarBoost": null,
        "enemyAttackScalarBoost": null,
        "enemyMoveEnergyScalarBoost": null,
        "enemyMoveEnergyGainScalarBoost": null,
        "enemyDesperationScalarBoost": null,
        "enemyPoison": null,
        "enemyPreventMove": null,
        "enemyCustomDialogue": ""
      },
      "sprite": null,
      "card": 4
    },
    {
      "id": 54,
      "move": {
        "id": 16,
        "name": "Caffeine Boost",
        "cost": 30,
        "damage": 0,
        "selfDefenseMultiplier": [2, 1],
        "selfAttackMultiplier": [1.6, 2],
        "selfMoveEnergyMultiplier": [1.6, 2],
        "selfMoveEnergyGainMultiplier": null,
        "selfDesperationMultiplier": null,
        "selfDefenseScalarBoost": null,
        "selfAttackScalarBoost": null,
        "selfMoveEnergyScalarBoost": null,
        "selfMoveEnergyGainScalarBoost": null,
        "selfPoison": [0.95, 0],
        "selfPreventMove": null,
        "selfCustomDialogue": null,
        "enemyDefenseMultiplier": null,
        "enemyAttackMultiplier": null,
        "enemyMoveEnergyMultiplier": null,
        "enemyMoveEnergyGainMultiplier": null,
        "enemyDesperationMultiplier": null,
        "enemyDefenseScalarBoost": null,
        "enemyAttackScalarBoost": null,
        "enemyMoveEnergyScalarBoost": null,
        "enemyMoveEnergyGainScalarBoost": null,
        "enemyDesperationScalarBoost": null,
        "enemyPoison": null,
        "enemyPreventMove": null,
        "enemyCustomDialogue": null
      },
      "sprite": null,
      "card": 4
    },
    {
      "id": 55,
      "move": {
        "id": 17,
        "name": "Domain Expansion: Infinite Cat",
        "cost": 90,
        "damage": 90,
        "selfDefenseMultiplier": null,
        "selfAttackMultiplier": null,
        "selfMoveEnergyMultiplier": null,
        "selfMoveEnergyGainMultiplier": null,
        "selfDesperationMultiplier": null,
        "selfDefenseScalarBoost": null,
        "selfAttackScalarBoost": null,
        "selfMoveEnergyScalarBoost": null,
        "selfMoveEnergyGainScalarBoost": null,
        "selfPoison": null,
        "selfPreventMove": null,
        "selfCustomDialogue": "I wasn't worried about losing. Because you're weak. \r\n$$BREAK$$\r\nDomain Expansion: Infinite Cat",
        "enemyDefenseMultiplier": null,
        "enemyAttackMultiplier": null,
        "enemyMoveEnergyMultiplier": null,
        "enemyMoveEnergyGainMultiplier": null,
        "enemyDesperationMultiplier": null,
        "enemyDefenseScalarBoost": null,
        "enemyAttackScalarBoost": null,
        "enemyMoveEnergyScalarBoost": null,
        "enemyMoveEnergyGainScalarBoost": null,
        "enemyDesperationScalarBoost": null,
        "enemyPoison": [0.8, 2],
        "enemyPreventMove": 2,
        "enemyCustomDialogue": ""
      },
      "sprite": null,
      "card": 4
    }
  ],
  "rarity": {
    "id": 13,
    "weight": 9,
    "name": "Special Grade",
    "plateColor": "#ddd6fe",
    "desperationConstant": 30
  },
  "name": "Michael Matiychenko",
  "nickname": "Meowtiychenko",
  "description": "Often referred to as \"the strongest Michael of today,\" Meowtiychenko possesses the power of the Catfinity technique and the Six Cat Ears. He is also very hot, handsome, smart, cool, smart, funny, nonchalant, tall, buff, hot, cool and nonchalant. He also has the Six Cat Ears. Oh, and did I mention he also wears the Six Cat Ears?",
  "defaultSprite": "https://idcpfzrbbasw.compat.objectstorage.us-ashburn-1.oraclecloud.com/mmk-media/collectibles/cards/sprites/85940a6c-ec41-4ceb-80bc-b7b5f8276bbc.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1f3741ba2c50be9f0347d59b2bd62d1e915891eb%2F20260603%2Fus-ashburn-1%2Fs3%2Faws4_request&X-Amz-Date=20260603T002300Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=5d1ee6afa1caddcf1181a7e127a2591e1e61f16fd257a03b699aea9d9405ba10",
  "audio": null,
  "health": 130,
  "defense": 30,
  "baseMoveEnergy": 100,
  "baseMoveEnergyGain": 10,
  "desperation": -2
}

const p2Card: Card ={
  "id": 11,
  "moves": [
    {
      "id": 56,
      "move": {
        "id": 26,
        "name": "Dismantle",
        "cost": 0,
        "damage": 15,
        "selfDefenseMultiplier": null,
        "selfAttackMultiplier": null,
        "selfMoveEnergyMultiplier": null,
        "selfMoveEnergyGainMultiplier": null,
        "selfDesperationMultiplier": null,
        "selfDefenseScalarBoost": null,
        "selfAttackScalarBoost": null,
        "selfMoveEnergyScalarBoost": null,
        "selfMoveEnergyGainScalarBoost": null,
        "selfPoison": null,
        "selfPreventMove": null,
        "selfCustomDialogue": "Brat.",
        "enemyDefenseMultiplier": null,
        "enemyAttackMultiplier": null,
        "enemyMoveEnergyMultiplier": null,
        "enemyMoveEnergyGainMultiplier": null,
        "enemyDesperationMultiplier": null,
        "enemyDefenseScalarBoost": null,
        "enemyAttackScalarBoost": null,
        "enemyMoveEnergyScalarBoost": null,
        "enemyMoveEnergyGainScalarBoost": null,
        "enemyDesperationScalarBoost": null,
        "enemyPoison": null,
        "enemyPreventMove": null,
        "enemyCustomDialogue": ""
      },
      "sprite": null,
      "card": 11
    },
    {
      "id": 57,
      "move": {
        "id": 27,
        "name": "Eleven Darknesses Ability: Adapt",
        "cost": 25,
        "damage": 0,
        "selfDefenseMultiplier": [1.3, 50],
        "selfAttackMultiplier": null,
        "selfMoveEnergyMultiplier": null,
        "selfMoveEnergyGainMultiplier": null,
        "selfDesperationMultiplier": null,
        "selfDefenseScalarBoost": null,
        "selfAttackScalarBoost": null,
        "selfMoveEnergyScalarBoost": null,
        "selfMoveEnergyGainScalarBoost": null,
        "selfPoison": null,
        "selfPreventMove": null,
        "selfCustomDialogue": "Looks like we have a countdown. To when that smirk will be wiped off your face, that is.",
        "enemyDefenseMultiplier": null,
        "enemyAttackMultiplier": null,
        "enemyMoveEnergyMultiplier": null,
        "enemyMoveEnergyGainMultiplier": null,
        "enemyDesperationMultiplier": null,
        "enemyDefenseScalarBoost": null,
        "enemyAttackScalarBoost": null,
        "enemyMoveEnergyScalarBoost": null,
        "enemyMoveEnergyGainScalarBoost": null,
        "enemyDesperationScalarBoost": null,
        "enemyPoison": null,
        "enemyPreventMove": null,
        "enemyCustomDialogue": ""
      },
      "sprite": null,
      "card": 11
    },
    {
      "id": 58,
      "move": {
        "id": 28,
        "name": "World Cutting Slash",
        "cost": 20,
        "damage": 40,
        "selfDefenseMultiplier": null,
        "selfAttackMultiplier": [0.8, 2],
        "selfMoveEnergyMultiplier": null,
        "selfMoveEnergyGainMultiplier": null,
        "selfDesperationMultiplier": null,
        "selfDefenseScalarBoost": null,
        "selfAttackScalarBoost": null,
        "selfMoveEnergyScalarBoost": null,
        "selfMoveEnergyGainScalarBoost": null,
        "selfPoison": null,
        "selfPreventMove": 1,
        "selfCustomDialogue": "In order to activate the broad-targeted, world-severing Dismantle, the same hand sign used for Malevolent HOS, Enmaten, is required. I am forced to impose a binding vow to the activation conditions for the proceeding turn, thus preventing my next move. Though you wouldn't be able to do anything enough to hurt me.",
        "enemyDefenseMultiplier": null,
        "enemyAttackMultiplier": null,
        "enemyMoveEnergyMultiplier": null,
        "enemyMoveEnergyGainMultiplier": null,
        "enemyDesperationMultiplier": null,
        "enemyDefenseScalarBoost": null,
        "enemyAttackScalarBoost": null,
        "enemyMoveEnergyScalarBoost": null,
        "enemyMoveEnergyGainScalarBoost": null,
        "enemyDesperationScalarBoost": null,
        "enemyPoison": null,
        "enemyPreventMove": null,
        "enemyCustomDialogue": ""
      },
      "sprite": null,
      "card": 11
    },
    {
      "id": 59,
      "move": {
        "id": 29,
        "name": "HOS Nuke",
        "cost": 75,
        "damage": 100,
        "selfDefenseMultiplier": null,
        "selfAttackMultiplier": null,
        "selfMoveEnergyMultiplier": null,
        "selfMoveEnergyGainMultiplier": null,
        "selfDesperationMultiplier": null,
        "selfDefenseScalarBoost": null,
        "selfAttackScalarBoost": null,
        "selfMoveEnergyScalarBoost": null,
        "selfMoveEnergyGainScalarBoost": null,
        "selfPoison": null,
        "selfPreventMove": 1,
        "selfCustomDialogue": "You should have burnt everything you desired to a cinder. To reach the heights of Meowtiychenko and not to worry about your future or identity. But you lacked the hunger to take hold of your desires.\r\n$$Break$$\r\nHowever, you did manage to amuse me somewhat. I've fought students in the era of analog, and yet you still stand as one of the best programmers I fought.\r\n$$Break$$\r\nStand Proud. You are strong.",
        "enemyDefenseMultiplier": null,
        "enemyAttackMultiplier": null,
        "enemyMoveEnergyMultiplier": null,
        "enemyMoveEnergyGainMultiplier": null,
        "enemyDesperationMultiplier": null,
        "enemyDefenseScalarBoost": null,
        "enemyAttackScalarBoost": null,
        "enemyMoveEnergyScalarBoost": null,
        "enemyMoveEnergyGainScalarBoost": null,
        "enemyDesperationScalarBoost": null,
        "enemyPoison": null,
        "enemyPreventMove": null,
        "enemyCustomDialogue": "pls dont nuke my HOS"
      },
      "sprite": null,
      "card": 11
    },
    {
      "id": 64,
      "move": {
        "id": 30,
        "name": "Domain Expansion: Malevolent HOS",
        "cost": 75,
        "damage": 59,
        "selfDefenseMultiplier": null,
        "selfAttackMultiplier": null,
        "selfMoveEnergyMultiplier": null,
        "selfMoveEnergyGainMultiplier": null,
        "selfDesperationMultiplier": null,
        "selfDefenseScalarBoost": null,
        "selfAttackScalarBoost": null,
        "selfMoveEnergyScalarBoost": null,
        "selfMoveEnergyGainScalarBoost": null,
        "selfPoison": null,
        "selfPreventMove": null,
        "selfCustomDialogue": "This is goodbye. You were born in an era without me and hailed for your strength. Yet you turned out to be painfully ordinary. \r\n$$BREAK$$\r\nDomain Expansion: Malevolent HOS",
        "enemyDefenseMultiplier": null,
        "enemyAttackMultiplier": null,
        "enemyMoveEnergyMultiplier": null,
        "enemyMoveEnergyGainMultiplier": null,
        "enemyDesperationMultiplier": null,
        "enemyDefenseScalarBoost": null,
        "enemyAttackScalarBoost": null,
        "enemyMoveEnergyScalarBoost": null,
        "enemyMoveEnergyGainScalarBoost": null,
        "enemyDesperationScalarBoost": null,
        "enemyPoison": [0.7, 3],
        "enemyPreventMove": null,
        "enemyCustomDialogue": ""
      },
      "sprite": "https://idcpfzrbbasw.compat.objectstorage.us-ashburn-1.oraclecloud.com/mmk-media/collectibles/moves/sprites/57910567-5289-4ece-ae06-acdd0c74b6d6.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1f3741ba2c50be9f0347d59b2bd62d1e915891eb%2F20260603%2Fus-ashburn-1%2Fs3%2Faws4_request&X-Amz-Date=20260603T002340Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=6f83541ee5e0d2c11e3b55dfc1d394d273afbb28dc5b83613511b16235f8eb51",
      "card": 11
    }
  ],
  "rarity": {
    "id": 14,
    "weight": 10,
    "name": "King of HOS Bombs",
    "plateColor": "#fecaca",
    "desperationConstant": 40
  },
  "name": "Michael Whalen",
  "nickname": "Evil Whalen",
  "description": "Whalen is an ancient programmer from the analog era. He was considered the strongest of all time and eventually took the title of the King of Errors, forgoing his kind. He transformed into a bug in order to persist through time, and was eventually awakened by a vessel. He has now regained his true form. He has no goal, no allegiance, no ideal, and his strength is merely used for personal enjoyment. If he finds it amusing to kill someone, he will. Otherwise, he won't. His power isolated him, and the only one who could match his power was Meowtiychenko.",
  "defaultSprite": "https://idcpfzrbbasw.compat.objectstorage.us-ashburn-1.oraclecloud.com/mmk-media/collectibles/cards/sprites/44a56e57-59f1-475d-90b0-17577bf854df.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1f3741ba2c50be9f0347d59b2bd62d1e915891eb%2F20260603%2Fus-ashburn-1%2Fs3%2Faws4_request&X-Amz-Date=20260603T002340Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=d248d3b9d7cc0b4a584e2097779b9bcfcd5bdae487ebe622cc81c0e21c5c3592",
  "audio": "https://idcpfzrbbasw.compat.objectstorage.us-ashburn-1.oraclecloud.com/mmk-media/collectibles/cards/audio/783348fb-53bb-467b-b494-f80b22e917a6.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1f3741ba2c50be9f0347d59b2bd62d1e915891eb%2F20260603%2Fus-ashburn-1%2Fs3%2Faws4_request&X-Amz-Date=20260603T002340Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=11a5e96b90194a6374e441210222d7838debd99c1b4c6afc22c723dc946b1868",
  "health": 150,
  "defense": 40,
  "baseMoveEnergy": 100,
  "baseMoveEnergyGain": 8,
  "desperation": -5
}


interface ActiveEffect {
  type: 'attackMul' | 'defenseMul' | 'energyMul' | 'energyGainMul' | 'desperationMul'
      | 'attackAdd' | 'defenseAdd' | 'energyAdd' | 'energyGainAdd' | 'desperationAdd' | 'poison'
  value: number
  turnsLeft: number
}

interface PlayerState {
  hp: number
  maxHp: number
  moveEnergy: number
  maxMoveEnergy: number
  moveEnergyGain: number
  defense: number
  attack: number
  activeEffects: ActiveEffect[]
  preventedTurns: number
  poisonTurns: number
  poisonMultiplier: number
  infiniteHealthTurns: number
}

type BattleState = 'player_turn' | 'dialogue' | 'effects' | 'prevented' | 'finished'
type DomainType = 'singulatory' | 'malice' | null


function calcRarityDefenseBonus(a: Card, b: Card): [number, number] {
  if (a.rarity.weight === b.rarity.weight) return [0, 0]
  const bonus = 3 * (Math.max(a.desperation, b.desperation) - Math.min(a.desperation, b.desperation))
  const isP1Lower = a.rarity.weight < b.rarity.weight
  return isP1Lower ? [bonus, 0] : [0, bonus]
}

const [p1RarityBonus, p2RarityBonus] = calcRarityDefenseBonus(p1Card, p2Card)

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
  }
}


const p1State = ref<PlayerState>(makePlayerState(p1Card, p1RarityBonus))
const p2State = ref<PlayerState>(makePlayerState(p2Card, p2RarityBonus))
const currentPlayer = ref<0 | 1>(Math.random() < 0.5 ? 0 : 1)
const battleState = ref<BattleState>('player_turn')
const winner = ref<0 | 1 | null>(null)


const activeDomain = ref<DomainType>(null)
const domainTurnsLeft = ref(0)

function activateDomain(domain: DomainType) {
  activeDomain.value = domain
  domainTurnsLeft.value = 3
}

function tickDomain() {
  if (activeDomain.value && domainTurnsLeft.value > 0) {
    domainTurnsLeft.value--
    if (domainTurnsLeft.value === 0) activeDomain.value = null
  }
}


interface DialogueLine { speaker: string; text: string }
const dialogueQueue = ref<DialogueLine[]>([])
const currentDialogue = ref<DialogueLine | null>(null)
let afterDialogueCallback: (() => void) | null = null

// NOTE: dialogue data uses $$BREAK$$ (case-insensitive) as separator
function enqueueDialogue(speaker: string, rawText: string) {
  const parts = rawText.split(/\$\$BREAK\$\$/i)
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed) dialogueQueue.value.push({ speaker, text: trimmed })
  }
}

function startDialogueQueue(onDone: () => void) {
  afterDialogueCallback = onDone
  if (dialogueQueue.value.length === 0) { onDone(); return }
  battleState.value = 'dialogue'
  advanceDialogue()
}

function advanceDialogue() {
  if (dialogueQueue.value.length > 0) {
    currentDialogue.value = dialogueQueue.value.shift()!
  } else {
    currentDialogue.value = null
    battleState.value = 'player_turn' // temporary;
    afterDialogueCallback?.()
    afterDialogueCallback = null
  }
}

function onDialogueFinished() {
  advanceDialogue()
}


const effectsMessage = ref('')
let afterEffectsCallback: (() => void) | null = null

function showEffects(message: string, onDone: () => void) {
  effectsMessage.value = message
  battleState.value = 'effects'
  afterEffectsCallback = onDone
}

function onEffectsFinished() {
  effectsMessage.value = ''
  battleState.value = 'player_turn'
  afterEffectsCallback?.()
  afterEffectsCallback = null
}


const preventedMessage = ref('')

function onPreventedFinished() {
  const stateRef = currentPlayer.value === 0 ? p1State : p2State
  stateRef.value.preventedTurns = Math.max(0, stateRef.value.preventedTurns - 1)
  regenEnergyAndPoison(stateRef)
  tickEffects(stateRef)
  switchTurn()
}


const currentMoves = computed<CardMove[]>(() =>
  currentPlayer.value === 0 ? p1Card.moves : p2Card.moves
)

const currentPlayerState = computed<PlayerState>(() =>
  currentPlayer.value === 0 ? p1State.value : p2State.value
)


function getEffectiveStat(state: PlayerState, type: 'attack' | 'defense' | 'energyGain'): number {
  const mulType = type === 'attack' ? 'attackMul' : type === 'defense' ? 'defenseMul' : 'energyGainMul'
  const addType = type === 'attack' ? 'attackAdd' : type === 'defense' ? 'defenseAdd' : 'energyGainAdd'
  let mul = 1.0
  let add = 0
  for (const e of state.activeEffects) {
    if (e.type === mulType) mul *= e.value
    if (e.type === addType) add += e.value
  }
  if (type === 'attack') return mul + add
  const base = type === 'defense' ? state.defense : state.moveEnergyGain
  return base * mul + add
}

function calcDamage(attacker: PlayerState, move: { damage: number | null }, defender: PlayerState): number {
  if (!move.damage) return 0
  const atkMul = getEffectiveStat(attacker, 'attack')
  const atkAdd = attacker.activeEffects.filter(e => e.type === 'attackAdd').reduce((s, e) => s + e.value, 0)
  const def = getEffectiveStat(defender, 'defense')
  return Math.max(0, Math.round((move.damage * atkMul + atkAdd) * (1 - def / 100)))
}

function applyEffectsFromMove(
  move: CardMove['move'],
  selfRef: typeof p1State,
  enemyRef: typeof p2State,
) {
  const s = selfRef.value
  const e = enemyRef.value

  if (move.selfAttackMultiplier)        s.activeEffects.push({ type: 'attackMul',     value: move.selfAttackMultiplier[0],        turnsLeft: move.selfAttackMultiplier[1] })
  if (move.selfDefenseMultiplier)       s.activeEffects.push({ type: 'defenseMul',    value: move.selfDefenseMultiplier[0],       turnsLeft: move.selfDefenseMultiplier[1] })
  if (move.selfMoveEnergyGainMultiplier) s.activeEffects.push({ type: 'energyGainMul', value: move.selfMoveEnergyGainMultiplier[0], turnsLeft: move.selfMoveEnergyGainMultiplier[1] })
  if (move.selfMoveEnergyMultiplier)    s.activeEffects.push({ type: 'energyMul',     value: move.selfMoveEnergyMultiplier[0],    turnsLeft: move.selfMoveEnergyMultiplier[1] })
  if (move.selfAttackScalarBoost)       s.activeEffects.push({ type: 'attackAdd',     value: move.selfAttackScalarBoost[0],       turnsLeft: move.selfAttackScalarBoost[1] })
  if (move.selfDefenseScalarBoost)      s.activeEffects.push({ type: 'defenseAdd',    value: move.selfDefenseScalarBoost[0],      turnsLeft: move.selfDefenseScalarBoost[1] })
  if (move.selfMoveEnergyGainScalarBoost) s.activeEffects.push({ type: 'energyGainAdd', value: move.selfMoveEnergyGainScalarBoost[0], turnsLeft: move.selfMoveEnergyGainScalarBoost[1] })
  if (move.selfPoison)       { s.poisonTurns = move.selfPoison[1]; s.poisonMultiplier = move.selfPoison[0] }
  if (move.selfPreventMove)  s.preventedTurns = move.selfPreventMove

  if (move.enemyAttackMultiplier)        e.activeEffects.push({ type: 'attackMul',     value: move.enemyAttackMultiplier[0],        turnsLeft: move.enemyAttackMultiplier[1] })
  if (move.enemyDefenseMultiplier)       e.activeEffects.push({ type: 'defenseMul',    value: move.enemyDefenseMultiplier[0],       turnsLeft: move.enemyDefenseMultiplier[1] })
  if (move.enemyMoveEnergyGainMultiplier) e.activeEffects.push({ type: 'energyGainMul', value: move.enemyMoveEnergyGainMultiplier[0], turnsLeft: move.enemyMoveEnergyGainMultiplier[1] })
  if (move.enemyMoveEnergyMultiplier)    e.activeEffects.push({ type: 'energyMul',     value: move.enemyMoveEnergyMultiplier[0],    turnsLeft: move.enemyMoveEnergyMultiplier[1] })
  if (move.enemyAttackScalarBoost)       e.activeEffects.push({ type: 'attackAdd',     value: move.enemyAttackScalarBoost[0],       turnsLeft: move.enemyAttackScalarBoost[1] })
  if (move.enemyDefenseScalarBoost)      e.activeEffects.push({ type: 'defenseAdd',    value: move.enemyDefenseScalarBoost[0],      turnsLeft: move.enemyDefenseScalarBoost[1] })
  if (move.enemyMoveEnergyGainScalarBoost) e.activeEffects.push({ type: 'energyGainAdd', value: move.enemyMoveEnergyGainScalarBoost[0], turnsLeft: move.enemyMoveEnergyGainScalarBoost[1] })
  if (move.enemyPoison)      { e.poisonTurns = move.enemyPoison[1]; e.poisonMultiplier = move.enemyPoison[0] }
  if (move.enemyPreventMove) e.preventedTurns = move.enemyPreventMove
}

function tickEffects(stateRef: typeof p1State) {
  stateRef.value.activeEffects = stateRef.value.activeEffects
    .map(e => ({ ...e, turnsLeft: e.turnsLeft - 1 }))
    .filter(e => e.turnsLeft > 0)
}

function regenEnergyAndPoison(stateRef: typeof p1State) {
  const s = stateRef.value
  s.moveEnergy = Math.min(s.maxMoveEnergy, s.moveEnergy + getEffectiveStat(s, 'energyGain'))

  if (s.poisonTurns > 0) {
    if (s.infiniteHealthTurns <= 0) s.hp = Math.round(s.hp * s.poisonMultiplier)
    s.poisonTurns--
    if (s.poisonTurns === 0) s.poisonMultiplier = 1
  }

  if (s.infiniteHealthTurns > 0) {
    s.infiniteHealthTurns--
    s.hp = 999999
    s.maxHp = 999999
  }
}

function buildEffectsMessage(p1: PlayerState, p2: PlayerState): string {
  const lines: string[] = []
  const typeLabel: Record<string, string> = {
    attackMul: 'ATK ×', defenseMul: 'DEF ×', energyGainMul: 'Energy Gain ×', energyMul: 'Energy ×',
    attackAdd: 'ATK +', defenseAdd: 'DEF +', energyGainAdd: 'Energy Gain +', energyAdd: 'Energy +',
  }
  for (const [label, s] of [[p1Card.name, p1], [p2Card.name, p2]] as [string, PlayerState][]) {
    for (const e of s.activeEffects) {
      const tl = typeLabel[e.type]
      if (tl) lines.push(`${label}: ${tl}${e.value} for ${e.turnsLeft} more turn${e.turnsLeft !== 1 ? 's' : ''}`)
    }
    if (s.poisonTurns > 0)         lines.push(`${label}: Poisoned (×${s.poisonMultiplier}) for ${s.poisonTurns} more turn${s.poisonTurns !== 1 ? 's' : ''}`)
    if (s.preventedTurns > 0)      lines.push(`${label}: Cannot move for ${s.preventedTurns} more turn${s.preventedTurns !== 1 ? 's' : ''}`)
    if (s.infiniteHealthTurns > 0) lines.push(`${label}: INFINITE HEALTH for ${s.infiniteHealthTurns} more turn${s.infiniteHealthTurns !== 1 ? 's' : ''}`)
  }
  return lines.join('\n')
}


function skipToValidTurn() {
  const state = currentPlayer.value === 0 ? p1State.value : p2State.value
  battleState.value = state.preventedTurns > 0 ? 'prevented' : 'player_turn'
}

function switchTurn() {
  currentPlayer.value = currentPlayer.value === 0 ? 1 : 0
  skipToValidTurn()
}

function selectMove(cardMove: CardMove) {
  if (battleState.value !== 'player_turn') return

  const selfRef  = currentPlayer.value === 0 ? p1State : p2State
  const enemyRef = currentPlayer.value === 0 ? p2State : p1State
  const selfCard = currentPlayer.value === 0 ? p1Card  : p2Card
  const move     = cardMove.move

  if (move.cost !== null) {
    selfRef.value.moveEnergy = Math.max(0, selfRef.value.moveEnergy - move.cost)
  }

  dialogueQueue.value = []
  if (move.selfCustomDialogue)  enqueueDialogue(selfCard.name,  move.selfCustomDialogue)
  if (move.enemyCustomDialogue) enqueueDialogue(selfCard === p1Card ? p2Card.name : p1Card.name, move.enemyCustomDialogue)

  const runMoveExecution = () => {
    if (move.id === 17) activateDomain('singulatory')
    else if (move.id === 30) activateDomain('malice')

    let jackpotHit = false
    if (move.id === 34 && Math.floor(Math.random() * 239) === 0) {
      jackpotHit = true
      selfRef.value.hp = 999999
      selfRef.value.maxHp = 999999
      selfRef.value.infiniteHealthTurns = 10
    }

    if (move.damage) {
      const dmg = calcDamage(selfRef.value, move, enemyRef.value)
      enemyRef.value.hp = Math.max(0, enemyRef.value.hp - dmg)
    }

    applyEffectsFromMove(move, selfRef, enemyRef)

    if (enemyRef.value.hp <= 0) {
      winner.value = currentPlayer.value
      battleState.value = 'finished'
      return
    }

    regenEnergyAndPoison(selfRef)
    tickEffects(selfRef)
    tickDomain()

    const afterJackpot = (next: () => void) => {
      if (!jackpotHit) { next(); return }
      dialogueQueue.value = []
      enqueueDialogue(selfCard.name, 'HOLD UP, WAIT, I JUST HIT THE JACKPOT')
      startDialogueQueue(next)
    }

    const msg = buildEffectsMessage(p1State.value, p2State.value)
    afterJackpot(() => {
      if (msg) showEffects(msg, () => switchTurn())
      else switchTurn()
    })
  }

  if (dialogueQueue.value.length > 0) startDialogueQueue(runMoveExecution)
  else runMoveExecution()
}

watch(battleState, (val) => {
  if (val === 'prevented') {
    const name = currentPlayer.value === 0 ? p1Card.name : p2Card.name
    preventedMessage.value = `${name} is unable to move this turn.`
  }
})


function resetBattle() {
  p1State.value       = makePlayerState(p1Card, p1RarityBonus)
  p2State.value       = makePlayerState(p2Card, p2RarityBonus)
  currentPlayer.value = Math.random() < 0.5 ? 0 : 1
  winner.value        = null
  activeDomain.value  = null
  domainTurnsLeft.value = 0
  dialogueQueue.value = []
  currentDialogue.value = null
  effectsMessage.value  = ''
  skipToValidTurn()
}

skipToValidTurn()


const audioRef = ref<HTMLAudioElement | null>(null)

function resolveAudioSrc(): string | null {
  const p1Audio = p1Card.audio
  const p2Audio = p2Card.audio

  if (p1Audio && p2Audio) {
    const useP1 = p1Card.rarity.weight >= p2Card.rarity.weight
    return useP1 ? p1Audio : p2Audio
  }
  if (p1Audio) return p1Audio
  if (p2Audio) return p2Audio
  return null
}

onMounted(() => {
  const src = resolveAudioSrc()
  if (!src) return

  const audio = new Audio(src)
  audio.loop = true
  audio.volume = 0.5
  audio.play().catch(() => {
    const resume = () => { audio.play(); window.removeEventListener('pointerdown', resume) }
    window.addEventListener('pointerdown', resume)
  })
  audioRef.value = audio
})

onBeforeUnmount(() => {
  audioRef.value?.pause()
  audioRef.value = null
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Share+Tech+Mono&display=swap');

:root {
  --p1-accent: #f59e0b;
  --p2-accent: #a78bfa;
}


.battle-root {
  background: #050508;
  background-image:
    radial-gradient(ellipse 80% 60% at 20% 50%, rgba(245, 158, 11, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 80% 60% at 80% 50%, rgba(167, 139, 250, 0.04) 0%, transparent 60%);
  font-family: 'Share Tech Mono', monospace;
}

.font-display { font-family: 'Cinzel', serif; }


.text-p1-accent   { color: var(--p1-accent); }
.text-p2-accent   { color: var(--p2-accent); }
.border-p1-accent { border-color: var(--p1-accent); }
.border-p2-accent { border-color: var(--p2-accent); }

.bg-p1-accent\/10  { background-color: rgba(245, 158, 11, 0.1); }
.bg-p2-accent\/10  { background-color: rgba(167, 139, 250, 0.1); }
.bg-p1-accent\/30  { background-color: rgba(245, 158, 11, 0.3); }
.bg-p2-accent\/30  { background-color: rgba(167, 139, 250, 0.3); }
.bg-p1-accent\/80  { background-color: rgba(245, 158, 11, 0.8); }
.bg-p2-accent\/80  { background-color: rgba(167, 139, 250, 0.8); }

.border-p1-accent\/40 { border-color: rgba(245, 158, 11, 0.4); }
.border-p2-accent\/40 { border-color: rgba(167, 139, 250, 0.4); }
.border-p1-accent\/60 { border-color: rgba(245, 158, 11, 0.6); }
.border-p2-accent\/60 { border-color: rgba(167, 139, 250, 0.6); }

.hover\:border-p1-accent:hover { border-color: var(--p1-accent); }
.hover\:border-p2-accent:hover { border-color: var(--p2-accent); }
.hover\:bg-p1-accent\/10:hover { background-color: rgba(245, 158, 11, 0.1); }
.hover\:bg-p2-accent\/10:hover { background-color: rgba(167, 139, 250, 0.1); }

.shadow-p1 { box-shadow: 0 0 20px rgba(245, 158, 11, 0.15); }
.shadow-p2 { box-shadow: 0 0 20px rgba(167, 139, 250, 0.15); }

.text-p1-accent\/70 { color: rgba(245, 158, 11, 0.7); }
.text-p2-accent\/70 { color: rgba(167, 139, 250, 0.7); }

.scanlines {
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0, 0, 0, 0.15) 2px, rgba(0, 0, 0, 0.15) 4px
  );
}


.battlefield {
  min-height: 55vh;
  background: linear-gradient(
    to bottom,
    #0a0a14 0%,
    #0d0d1f 45%,
    #12101a 55%,
    #0c0b10 100%
  );
}

.ground {
  height: 80px;
  background: linear-gradient(
    to bottom,
    #1a1428 0%,
    #120f1e 40%,
    #0d0b16 100%
  );
  border-top: 1px solid rgba(167, 139, 250, 0.12);
}


.sprite-enemy {
  right: 10%;
  top: 6%;
}

.sprite-player {
  left: 10%;
  bottom: 80px;
}

.sprite-img {
  width: 180px;
  height: 180px;
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6));
  transition: filter 0.3s ease, transform 0.3s ease;
}

.sprite-active .sprite-img {
  filter:
    drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6))
    drop-shadow(0 0 12px rgba(255, 255, 255, 0.12));
  animation: sprite-bob 1.4s ease-in-out infinite;
}

.sprite-img.hurt {
  filter:
    drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6))
    sepia(1) saturate(4) hue-rotate(-10deg) brightness(0.85);
}

.sprite-shadow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 14px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  filter: blur(4px);
}

.enemy-shadow  { width: 120px; }
.player-shadow { width: 120px; }

@keyframes sprite-bob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}


.bottom-panel {
  /* FIX: explicit height so children with height:100% have something to resolve against */
  height: 160px;
  min-height: 160px;
  background: #0b0b14;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0;
}

.panel-slot {
  height: 100%;
  display: flex;
  flex-direction: column;
}


.move-panel {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100%;
}

.move-panel-label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 20px 24px;
  min-width: 180px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.015);
  flex-shrink: 0;
}

.move-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
  gap: 1px;
  flex: 1;
  min-height: 160px;
  background: rgba(255, 255, 255, 0.04);
}

.move-grid > * {
  background: #0b0b14;
  min-height: 70px;
}


.idle-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
}


.dialogue-slide-enter-active,
.dialogue-slide-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.dialogue-slide-enter-from,
.dialogue-slide-leave-to     { opacity: 0; transform: translateY(8px); }

.moves-slide-enter-active,
.moves-slide-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.moves-slide-enter-from,
.moves-slide-leave-to     { opacity: 0; transform: translateY(6px); }

.win-fade-enter-active,
.win-fade-leave-active { transition: opacity 0.5s ease; }
.win-fade-enter-from,
.win-fade-leave-to     { opacity: 0; }

.domain-fade-enter-active,
.domain-fade-leave-active { transition: opacity 0.6s ease; }
.domain-fade-enter-from,
.domain-fade-leave-to     { opacity: 0; }


.win-box { animation: win-pulse 2s ease-in-out infinite alternate; }
@keyframes win-pulse {
  from { box-shadow: 0 0 20px currentColor; }
  to   { box-shadow: 0 0 60px currentColor; }
}
</style>