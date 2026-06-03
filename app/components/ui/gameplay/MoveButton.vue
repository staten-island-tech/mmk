<template>
  <button
    class="move-btn flex flex-col gap-1 p-3 text-left transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed w-full h-full"
    :class="[accentClass]"
    :disabled="!canAfford"
    @click="handleClick"
  >
    <div class="flex items-center justify-between w-full gap-2">
      <span class="move-name">{{ move.move.name }}</span>
      <span class="move-cost" :class="isFree ? 'free' : ''">
        {{ isFree ? 'Free' : move.move.cost + ' EP' }}
      </span>
    </div>
    <div class="move-meta">
      <span v-if="move.move.damage">DMG {{ move.move.damage }}</span>
      <span v-if="move.move.selfCustomDialogue || move.move.enemyCustomDialogue" class="move-dialogue-icon">✦</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CardMove } from '~/types/collections'

const props = defineProps<{
  move: CardMove
  currentEnergy: number
  accent: 'p1' | 'p2'
}>()

const emit = defineEmits<{
  (e: 'select', move: CardMove): void
}>()

const isFree = computed(() => props.move.move.cost === 0 || props.move.move.cost === null)
const canAfford = computed(() =>
  isFree.value || (props.move.move.cost !== null && props.currentEnergy >= props.move.move.cost)
)
const accentClass = computed(() =>
  props.accent === 'p1' ? 'accent-p1' : 'accent-p2'
)

function handleClick() {
  if (canAfford.value) emit('select', props.move)
}
</script>

<style scoped>
.move-btn {
  background: #0b0b14;
  border: 1px solid transparent;
  font-family: 'Share Tech Mono', monospace;
}

/* P1 amber */
.accent-p1 {
  border-color: rgba(245, 158, 11, 0.4);
  color: #f59e0b;
}
.accent-p1:hover:not(:disabled) {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

/* P2 violet */
.accent-p2 {
  border-color: rgba(167, 139, 250, 0.4);
  color: #a78bfa;
}
.accent-p2:hover:not(:disabled) {
  border-color: #a78bfa;
  background: rgba(167, 139, 250, 0.1);
}

.move-name {
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* inherit color from accent class */
}

.move-cost {
  font-size: 0.7rem;
  white-space: nowrap;
  flex-shrink: 0;
  /* inherit color from accent class */
}
.move-cost.free {
  color: rgba(255, 255, 255, 0.3);
}

.move-meta {
  display: flex;
  gap: 12px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

.move-dialogue-icon {
  color: rgba(255, 255, 255, 0.2);
}
</style>