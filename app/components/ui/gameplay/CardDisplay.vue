<template>
  <UiCardSimple class="!gap-0 !p-0 !w-96 h-96 !ring-0">
    <!-- Player label -->
    <div
      class="flex justify-center items-center gap-5 p-2 border-b-2 text-xl font-semibold tracking-wider"
      :class="
        accent === 1
          ? 'text-game-p1-accent border-game-p1-light bg-game-p1-light/10'
          : 'text-game-p2-accent border-game-p2-light bg-game-p2-light/10'
      "
    >
      {{ props.playerLabel }}
    </div>
    <!-- Details -->
    <div
      class="flex items-center gap-3 p-5 border-b-2 border-slate-400 bg-slate-200"
      :class="flip ? 'flex-row-reverse' : ''"
    >
      <div
        class="w-16 h-16 shrink-0 border border-white/10 overflow-hidden bg-black/30"
      >
        <img :src="card.defaultSprite" class="w-full h-full object-cover" />
      </div>
      <div :class="flip ? 'text-right' : 'text-left'">
        <p class="text-lg tracking-wide leading-tight font-bold">
          {{ card.name }}
        </p>
        <p class="text-sm italic">
          {{ card.nickname }}
        </p>
        <p class="text-sm uppercase">{{ card.rarity.name }}</p>
      </div>
    </div>
    <div class="flex flex-col gap-3 m-1 p-2 h-full ring-4 ring-card-ring">
      <!-- Health bar -->
      <div class="flex flex-col gap-1">
        <div class="flex justify-between text-xs">
          <span>Health</span>
          <span>{{ Math.ceil(state.hp) }} / {{ state.maxHp }}</span>
        </div>
        <div class="h-2 w-full bg-slate-300 overflow-hidden">
          <div
            class="h-full transition-all duration-500 bg-violet-400"
            :style="{ width: hpPercent + '%' }"
          />
        </div>
      </div>

      <!-- Energy bar -->
      <div class="flex flex-col gap-1">
        <div class="flex justify-between text-xs">
          <span>Energy</span>
          <span
            >{{ Math.floor(state.moveEnergy) }} /
            {{ state.maxMoveEnergy }}</span
          >
        </div>
        <div class="h-2 w-full bg-slate-300 overflow-hidden">
          <div
            class="h-full transition-all duration-500 bg-orange-400"
            :style="{ width: energyPercent + '%' }"
          />
        </div>
      </div>

      <!-- Defense (immutable stat) -->
      <div
        class="flex justify-between items-center mt-auto text-xs text-slate-500"
      >
        <span class="mr-2 tracking-wide uppercase">Defense</span>
        <div class="h-px w-full bg-slate-300"></div>
        <span
          class="px-2 py-0.5 font-semibold border border-slate-300 bg-slate-200"
          >{{ state.defense }}</span
        >
      </div>
    </div>
  </UiCardSimple>
</template>
<script setup lang="ts">
import { computed } from "vue";
import colors from "tailwindcss/colors";
import type { Card } from "~/types/collection";

interface PlayerState {
  hp: number;
  maxHp: number;
  moveEnergy: number;
  maxMoveEnergy: number;
  defense: number;
}

const props = defineProps<{
  card: Card;
  state: PlayerState;
  isActive?: boolean;
  playerLabel: string;
  accent: 1 | 2;
  flip?: boolean;
}>();

const hpPercent = computed(() =>
  Math.max(0, (props.state.hp / props.state.maxHp) * 100),
);

const energyPercent = computed(() =>
  Math.max(0, (props.state.moveEnergy / props.state.maxMoveEnergy) * 100),
);
</script>
<style scoped></style>
