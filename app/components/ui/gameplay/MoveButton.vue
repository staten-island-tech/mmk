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
      <span>{{ moveSummary }}</span>
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

const selfAttackDisplay = computed<string>(() => {
  const multiplier = props.move.move.selfAttackMultiplier;
  const scalar = props.move.move.selfAttackScalarBoost;

  if (!multiplier && !scalar) return "";
  if (multiplier && !scalar)
    return `${multiplier[1]}-turn attack ×${multiplier[0]}`;
  if (!multiplier && scalar) return `${scalar[1]}-turn attack +${scalar[0]}`;
  return `${multiplier![1]}-turn attack ×${multiplier![0]}, ${scalar![1]}-turn attack +${scalar![0]}`;
});

const selfDefenseDisplay = computed<string>(() => {
  const multiplier = props.move.move.selfDefenseMultiplier;
  const scalar = props.move.move.selfDefenseScalarBoost;

  if (!multiplier && !scalar) return "";
  if (multiplier && !scalar)
    return `${multiplier[1]}-turn defense ×${multiplier[0]}`;
  if (!multiplier && scalar) return `${scalar[1]}-turn defense +${scalar[0]}`;
  return `${multiplier![1]}-turn defense ×${multiplier![0]}, ${scalar![1]}-turn defense +${scalar![0]}`;
});

const selfEnergyDisplay = computed<string>(() => {
  const multiplier = props.move.move.selfMoveEnergyMultiplier;
  const scalar = props.move.move.selfMoveEnergyScalarBoost;

  if (!multiplier && !scalar) return "";
  if (multiplier && !scalar)
    return `${multiplier[1]}-turn energy ×${multiplier[0]}`;
  if (!multiplier && scalar) return `${scalar[1]}-turn energy +${scalar[0]}`;
  return `${multiplier![1]}-turn energy ×${multiplier![0]}, ${scalar![1]}-turn energy +${scalar![0]}`;
});

const selfEnergyGainDisplay = computed<string>(() => {
  const multiplier = props.move.move.selfMoveEnergyGainMultiplier;
  const scalar = props.move.move.selfMoveEnergyGainScalarBoost;

  if (!multiplier && !scalar) return "";
  if (multiplier && !scalar)
    return `${multiplier[1]}-turn energy gain ×${multiplier[0]}`;
  if (!multiplier && scalar)
    return `${scalar[1]}-turn energy gain +${scalar[0]}`;
  return `${multiplier![1]}-turn energy gain ×${multiplier![0]}, ${scalar![1]}-turn energy gain +${scalar![0]}`;
});

const selfDesperationDisplay = computed<string>(() => {
  const multiplier = props.move.move.selfDesperationMultiplier;
  if (!multiplier) return "";
  return `${multiplier[1]}-turn desperation ×${multiplier[0]}`;
});

const selfPoisonDisplay = computed<string>(() => {
  const poison = props.move.move.selfPoison;
  if (!poison) return "";
  return `${poison[1]}-turn poison ×${poison[0]}`;
});

const selfPreventMoveDisplay = computed<string>(() => {
  const turns = props.move.move.selfPreventMove;
  if (!turns) return "";
  return `${turns}-turn self-stun`;
});

const enemyAttackDisplay = computed<string>(() => {
  const multiplier = props.move.move.enemyAttackMultiplier;
  const scalar = props.move.move.enemyAttackScalarBoost;

  if (!multiplier && !scalar) return "";
  if (multiplier && !scalar)
    return `${multiplier[1]}-turn enemy attack ×${multiplier[0]}`;
  if (!multiplier && scalar)
    return `${scalar[1]}-turn enemy attack +${scalar[0]}`;
  return `${multiplier![1]}-turn enemy attack ×${multiplier![0]}, ${scalar![1]}-turn enemy attack +${scalar![0]}`;
});

const enemyDefenseDisplay = computed<string>(() => {
  const multiplier = props.move.move.enemyDefenseMultiplier;
  const scalar = props.move.move.enemyDefenseScalarBoost;

  if (!multiplier && !scalar) return "";
  if (multiplier && !scalar)
    return `${multiplier[1]}-turn enemy defense ×${multiplier[0]}`;
  if (!multiplier && scalar)
    return `${scalar[1]}-turn enemy defense +${scalar[0]}`;
  return `${multiplier![1]}-turn enemy defense ×${multiplier![0]}, ${scalar![1]}-turn enemy defense +${scalar![0]}`;
});

const enemyEnergyDisplay = computed<string>(() => {
  const multiplier = props.move.move.enemyMoveEnergyMultiplier;
  const scalar = props.move.move.enemyMoveEnergyScalarBoost;

  if (!multiplier && !scalar) return "";
  if (multiplier && !scalar)
    return `${multiplier[1]}-turn enemy energy ×${multiplier[0]}`;
  if (!multiplier && scalar)
    return `${scalar[1]}-turn enemy energy +${scalar[0]}`;
  return `${multiplier![1]}-turn enemy energy ×${multiplier![0]}, ${scalar![1]}-turn enemy energy +${scalar![0]}`;
});

const enemyEnergyGainDisplay = computed<string>(() => {
  const multiplier = props.move.move.enemyMoveEnergyGainMultiplier;
  const scalar = props.move.move.enemyMoveEnergyGainScalarBoost;

  if (!multiplier && !scalar) return "";
  if (multiplier && !scalar)
    return `${multiplier[1]}-turn enemy energy gain ×${multiplier[0]}`;
  if (!multiplier && scalar)
    return `${scalar[1]}-turn enemy energy gain +${scalar[0]}`;
  return `${multiplier![1]}-turn enemy energy gain ×${multiplier![0]}, ${scalar![1]}-turn enemy energy gain +${scalar![0]}`;
});

const enemyDesperationDisplay = computed<string>(() => {
  const multiplier = props.move.move.enemyDesperationMultiplier;
  if (!multiplier) return "";
  return `${multiplier[1]}-turn enemy desperation ×${multiplier[0]}`;
});

const enemyPoisonDisplay = computed<string>(() => {
  const poison = props.move.move.enemyPoison;
  if (!poison) return "";
  return `${poison[1]}-turn enemy poison ×${poison[0]}`;
});

const enemyPreventMoveDisplay = computed<string>(() => {
  const turns = props.move.move.enemyPreventMove;
  if (!turns) return "";
  return `${turns}-turn enemy stun`;
});

const domainDisplay = computed<string>(() => {
  if (!props.move.move.domain) return "";
  return `${props.move.move.domainDuration}-turn domain`;
});

const moveSummary = computed<string>(() => {
  const parts = [];

  // main move attributes
  if (props.move.move.damage) parts.push(`${props.move.move.damage} damage`);
  if (domainDisplay.value) parts.push(domainDisplay.value);

  // self effects
  if (selfAttackDisplay.value) parts.push(selfAttackDisplay.value);
  if (selfDefenseDisplay.value) parts.push(selfDefenseDisplay.value);
  if (selfEnergyDisplay.value) parts.push(selfEnergyDisplay.value);
  if (selfEnergyGainDisplay.value) parts.push(selfEnergyGainDisplay.value);
  if (selfDesperationDisplay.value) parts.push(selfDesperationDisplay.value);
  if (selfPoisonDisplay.value) parts.push(selfPoisonDisplay.value);
  if (selfPreventMoveDisplay.value) parts.push(selfPreventMoveDisplay.value);

  // enemy effects
  if (enemyAttackDisplay.value) parts.push(enemyAttackDisplay.value);
  if (enemyDefenseDisplay.value) parts.push(enemyDefenseDisplay.value);
  if (enemyEnergyDisplay.value) parts.push(enemyEnergyDisplay.value);
  if (enemyEnergyGainDisplay.value) parts.push(enemyEnergyGainDisplay.value);
  if (enemyDesperationDisplay.value) parts.push(enemyDesperationDisplay.value);
  if (enemyPoisonDisplay.value) parts.push(enemyPoisonDisplay.value);
  if (enemyPreventMoveDisplay.value) parts.push(enemyPreventMoveDisplay.value);

  if (parts.length === 0) return "This move has no effects.";

  const summary = parts.join(", ");
  return summary.charAt(0).toUpperCase() + summary.slice(1);
});

function handleClick() {
  if (canAfford.value) emit("select", props.move);
}
</script>

<style scoped></style>
