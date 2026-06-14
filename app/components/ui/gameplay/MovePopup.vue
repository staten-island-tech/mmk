<template>
  <TransitionGroup
    name="popup"
    tag="div"
    class="pointer-events-none z-40 absolute inset-0 flex justify-center items-center"
  >
    <div
      v-for="popup in props.popups"
      :key="popup.id"
      class="absolute flex flex-col items-center text-center gap-1"
    >
      <div
        class="-z-10 absolute rounded-full top-1/2 left-1/2 w-[125%] h-[125%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/10 blur-2xl"
      />
      <p class="text-lg text-slate-500 tracking-widest uppercase">
        {{ popup.username }}
      </p>
      <p
        class="text-3xl tracking-wider"
        :style="{ color: typeColor(popup.type) }"
      >
        {{ popup.moveName }}
      </p>
      <p
        v-if="popup.damage !== null && popup.damage > 0"
        class="text-xl text-red-400 font-medium"
      >
        -{{ popup.damage }} HP
      </p>
    </div>
  </TransitionGroup>
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
  default: colors.slate[800],
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

.popup-enter-from {
  opacity: 0;
  filter: blur(12px);
  transform: translateY(20px);
}

.popup-leave-to {
  opacity: 0;
  filter: blur(12px);
  transform: translateY(-20px);
}
</style>
