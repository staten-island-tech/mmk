<template>
  <button
    class="relative flex flex-col gap-1 w-full h-full px-4 py-2 text-md text-secondary-foreground border-4 border-double border-secondary-border bg-slate-200 transition-all duration-150 enabled:hover:border-secondary-hover enabled:hover:bg-secondary-hover enabled:hover:text-secondary-hover-foreground enabled:active:bg-secondary-hover enabled:active:border-secondary-hover enabled:active:text-secondary-hover-foreground enabled:active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:border-slate-400 disabled:text-slate-500"
    :disabled="!canUse"
    @click="handleClick"
  >
    <!-- Cooldown badge -->
    <div
      v-if="props.cooldownRemaining > 0"
      class="absolute flex items-center gap-1 bottom-2 right-2 text-xs text-white bg-slate-500 px-2 py-px"
    >
      <Icon name="pixelarticons:clock" class="text-sm" />
      {{ props.cooldownRemaining }}
    </div>

    <div class="flex justify-between items-center w-full gap-2 font-semibold">
      <span>{{ props.move.move.name }}</span>
      <span class="text-sm font-alt">
        {{ isFree ? "Free" : props.move.move.cost + " energy" }}
      </span>
    </div>

    <div
      class="flex items-center gap-1 text-sm font-alt font-semibold tracking-wider"
    >
      <span>{{ moveSummary || "This move has no effects." }}</span>
      <Icon
        v-if="
          props.move.move.selfCustomDialogue ||
          props.move.move.enemyCustomDialogue
        "
        name="pixelarticons:comment"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  move: CardMove;
  cooldownRemaining: number;
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

const canUse = computed(
  () =>
    canAfford.value &&
    (!props.cooldownRemaining || props.cooldownRemaining <= 0),
);

const selfAttackDisplay = computed(() => {
  const multiplier = props.move.move.selfAttackMultiplier?.[0];
  const scalar = props.move.move.selfAttackScalarBoost?.[0];

  if (!multiplier && !scalar) return "";
  if (multiplier && !scalar) return `×${multiplier} attack`;
  if (!multiplier && scalar) return `+${scalar} attack`;
  return `×${multiplier} +${scalar} attack`;
});

const selfDefenseDisplay = computed(() => {
  const multiplier = props.move.move.selfDefenseMultiplier?.[0];
  const scalar = props.move.move.selfDefenseScalarBoost?.[0];

  if (!multiplier && !scalar) return "";
  if (multiplier && !scalar) return `×${multiplier} defense`;
  if (!multiplier && scalar) return `+${scalar} defense`;
  return `×${multiplier} +${scalar} defense`;
});

const moveSummary = computed(() => {
  const parts = [];
  if (props.move.move.damage) parts.push(`${props.move.move.damage} damage`);
  if (selfAttackDisplay.value) parts.push(selfAttackDisplay.value);
  if (selfDefenseDisplay.value) parts.push(selfDefenseDisplay.value);
  return parts.join(", ");
});

function handleClick() {
  if (canAfford.value) emit("select", props.move);
}
</script>

<style scoped></style>
