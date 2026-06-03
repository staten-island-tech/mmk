<template>
  <div
    class="flex flex-col gap-3 p-4 border border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-300"
    :class="[isActive ? (accent === 'p1' ? 'border-p1-accent/60 shadow-p1' : 'border-p2-accent/60 shadow-p2') : 'border-white/5']"
  >
    <!-- Player label -->
    <div class="flex items-center gap-2" :class="flip ? 'flex-row-reverse' : ''">
      <span
        class="font-mono text-xs tracking-[0.3em] uppercase"
        :class="accent === 'p1' ? 'text-p1-accent' : 'text-p2-accent'"
      >{{ playerLabel }}</span>
      <div class="h-px flex-1 bg-white/10" />
      <span class="font-mono text-xs text-white/30">{{ card.rarity.name }}</span>
    </div>

    <!-- Sprite + name -->
    <div class="flex items-center gap-3" :class="flip ? 'flex-row-reverse' : ''">
      <div class="w-16 h-16 shrink-0 border border-white/10 overflow-hidden bg-black/30">
        <img :src="card.defaultSprite" :alt="card.name" class="w-full h-full object-cover" />
      </div>
      <div :class="flip ? 'text-right' : 'text-left'">
        <p class="font-display text-lg leading-tight text-white">{{ card.name }}</p>
        <p class="font-mono text-xs text-white/40 italic">{{ card.nickname }}</p>
      </div>
    </div>

    <!-- HP Bar -->
    <div class="flex flex-col gap-1">
      <div class="flex justify-between font-mono text-xs">
        <span class="text-white/50">HP</span>
        <span class="text-white/70">{{ Math.ceil(state.hp) }} / {{ state.maxHp }}</span>
      </div>
      <div class="h-2 w-full bg-white/10 overflow-hidden">
        <div
          class="h-full transition-all duration-500"
          :style="{ width: hpPct + '%', backgroundColor: hpColor }"
        />
      </div>
    </div>

    <!-- Energy Bar -->
    <div class="flex flex-col gap-1">
      <div class="flex justify-between font-mono text-xs">
        <span class="text-white/50">Energy</span>
        <span class="text-white/70">{{ Math.floor(state.moveEnergy) }} / {{ state.maxMoveEnergy }}</span>
      </div>
      <div class="h-1.5 w-full bg-white/10 overflow-hidden">
        <div
          class="h-full transition-all duration-500"
          :class="accent === 'p1' ? 'bg-p1-accent/80' : 'bg-p2-accent/80'"
          :style="{ width: energyPct + '%' }"
        />
      </div>
    </div>

    <!-- Defense -->
    <div class="flex justify-between font-mono text-xs text-white/40">
      <span>DEF</span>
      <span>{{ state.defense }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '~/types/collections'

interface PlayerState {
  hp: number
  maxHp: number
  moveEnergy: number
  maxMoveEnergy: number
  defense: number
}

const props = defineProps<{
  card: Card
  state: PlayerState
  isActive?: boolean
  playerLabel: string
  accent: 'p1' | 'p2'
  flip?: boolean
}>()

const hpPct = computed(() => Math.max(0, (props.state.hp / props.state.maxHp) * 100))
const energyPct = computed(() => Math.max(0, (props.state.moveEnergy / props.state.maxMoveEnergy) * 100))
const hpColor = computed(() => {
  if (hpPct.value > 50) return props.accent === 'p1' ? '#f59e0b' : '#a78bfa'
  if (hpPct.value > 25) return '#f97316'
  return '#ef4444'
})
</script>