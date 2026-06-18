<template>
  <UiCardSimple class="!gap-0 !p-0 w-full !md:w-96 md:h-96 !ring-0">
    <!-- Player label -->
    <div
      class="hidden md:flex justify-center items-center gap-5 p-2 border-b-2 text-xl font-semibold tracking-wider"
      :class="
        accent === 1
          ? 'text-game-p1-accent border-game-p1-light bg-game-p1-light/10'
          : 'text-game-p2-accent border-game-p2-light bg-game-p2-light/10'
      "
    >
      <span class="truncate">{{ props.playerLabel }}</span>
    </div>

    <!-- Details -->
    <div
      class="flex items-center gap-3 p-4 border-b-2 border-slate-400 bg-slate-200"
      :class="flip ? 'md:flex-row-reverse' : ''"
    >
      <div
        class="overflow-hidden shrink-0 p-2 w-20 h-20 border-4 border-double border-slate-400 bg-slate-300"
      >
        <img :src="card.defaultSprite" class="w-full h-full object-contain" />
      </div>
      <div class="overflow-hidden min-w-0" :class="flip ? 'md:text-right' : ''">
        <p class="text-lg tracking-wide leading-tight truncate font-bold">
          {{ card.name }}
        </p>
        <p class="text-sm truncate italic">
          {{ card.nickname }}
        </p>
        <p class="hidden md:block text-sm uppercase">{{ card.rarity.name }}</p>
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

      <!-- Immutable stats -->
      <div class="flex flex-col gap-2 mt-auto text-xs text-slate-500">
        <!-- Attack -->
        <div class="flex justify-between items-center">
          <span class="mr-2 tracking-wide uppercase">Attack Multiplier</span>
          <div class="h-px flex-1 bg-slate-300" />
          <span
            class="px-2 py-0.5 font-semibold border border-slate-300 bg-slate-200"
            >×{{ Math.round(state.effectiveAttack * 10) / 10 }}</span
          >
        </div>

        <!-- Defense -->
        <div class="flex justify-between items-center">
          <span class="mr-2 tracking-wide uppercase">Defense Strength</span>
          <div class="h-px flex-1 bg-slate-300" />
          <span
            class="px-2 py-0.5 font-semibold border border-slate-300 bg-slate-200"
            >{{ Math.round(state.effectiveDefense * 10) / 10 }}</span
          >
        </div>
      </div>
    </div>
  </UiCardSimple>
</template>
<script setup lang="ts">
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
