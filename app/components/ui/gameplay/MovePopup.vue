<template>
  <div
    class="pointer-events-none z-40 absolute inset-x-0 bottom-[30%] flex justify-center items-end"
  >
    <TransitionGroup
      name="popup"
      tag="div"
      class="flex flex-col items-center gap-2 w-full max-w-md px-4"
    >
      <UiCardSimple
        v-for="popup in props.popups"
        :key="popup.id"
        class="relative flex flex-col items-center text-center px-4 py-3 min-w-48"
      >
        <!-- Username -->
        <p class="text-xs text-slate-500 tracking-widest">
          {{ popup.username }}
        </p>

        <!-- Move name -->
        <p
          class="text-lg tracking-tight leading-none"
          :style="{ color: typeColor(popup.type) }"
        >
          {{ popup.moveName }}
        </p>

        <!-- Damage -->
        <p
          v-if="popup.damage !== null && popup.damage > 0"
          class="text-md text-red-400"
        >
          -{{ popup.damage }} HP
        </p>
      </UiCardSimple>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import colors from "tailwindcss/colors";
import type { BattlePopup, PopupType } from "~/composables/useBattlePopup";

const props = defineProps<{
  popups: BattlePopup[];
}>();

const TYPE_COLORS: Record<PopupType, string> = {
  attack: colors.red[500],
  defense: colors.sky[500],
  poison: colors.emerald[500],
  domain: colors.purple[500],
  default: colors.slate[500],
};

function typeColor(type: PopupType) {
  return TYPE_COLORS[type] ?? TYPE_COLORS.default;
}
</script>

<style scoped>
.popup-enter-active,
.popup-leave-active {
  transition: all 0.4s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  filter: blur(12px);
  transform: translateY(20px);
}
</style>
