<template>
  <button
    class="flex flex-col gap-1 w-full h-full px-4 py-2 text-md text-secondary-foreground border-4 border-double border-secondary-border bg-slate-200 transition-all duration-150 enabled:hover:border-secondary-hover enabled:hover:bg-secondary-hover enabled:hover:text-secondary-hover-foreground enabled:active:bg-secondary-hover enabled:active:border-secondary-hover enabled:active:text-secondary-hover-foreground enabled:active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:border-slate-400 disabled:text-slate-500"
    :disabled="!canAfford"
    @click="handleClick"
  >
    <div class="flex justify-between items-center w-full gap-2 font-semibold">
      <span class="tracking-wide">{{ move.move.name }}</span>
      <span class="text-sm font-alt">
        {{ isFree ? "Free" : move.move.cost + " energy" }}
      </span>
    </div>
    <div class="flex gap-1 text-sm tracking-wider">
      <span v-if="move.move.damage !== null" class="font-alt font-semibold"
        >{{ move.move.damage }} damage</span
      >
      <span v-if="move.move.selfCustomDialogue || move.move.enemyCustomDialogue"
        >✦</span
      >
    </div>
  </button>
</template>

<script setup lang="ts">
import type { CardMove } from "~/types/collection";

const props = defineProps<{
  move: CardMove;
  currentEnergy: number;
}>();

const emit = defineEmits<{
  (e: "select", move: CardMove): void;
}>();

const isFree = computed(
  () => props.move.move.cost === 0 || props.move.move.cost === null,
);

const canAfford = computed(
  () =>
    isFree.value ||
    (props.move.move.cost !== null &&
      props.currentEnergy >= props.move.move.cost),
);

function handleClick() {
  if (canAfford.value) emit("select", props.move);
}
</script>

<style scoped></style>
