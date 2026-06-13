<template>
  <div
    class="flex flex-col gap-5 w-full h-full min-h-0"
    @click="handleBoxClick"
  >
    <div class="flex flex-col gap-2 h-full min-h-0">
      <p class="text-sm text-slate-500 tracking-widest font-semibold uppercase">
        {{ speaker }}
      </p>

      <div class="overflow-y-auto w-full h-full min-h-0 whitespace-pre-line">
        <template v-if="sourceText">
          {{ displayText }}
        </template>
        <template v-else>
          <slot />
        </template>
      </div>

      <div class="flex justify-end items-center gap-1 w-full text-slate-400">
        <template v-if="displayText === sourceText">
          <span>Click to continue</span>
          <Icon name="pixelarticons:arrow-right" />
        </template>
        <template v-else>
          <span>Click to fast-forward</span>
          <Icon name="pixelarticons:arrow-right" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  speaker?: string;
  dialogueText?: string;
  typingSpeedCps: number;
}>();

const emit = defineEmits<{
  (e: "finished"): void;
}>();

const slots = useSlots();
const displayText = ref("");
const timer = ref<number | null>(null);
const finishTimer = ref<number | null>(null);
const hasFinished = ref(false);
let lastClickTime = 0;

const slotText = computed(() => {
  const content = slots.default?.();
  if (!content || content.length === 0) return "";
  const first = content[0];
  if (!first || typeof first.children !== "string") return "";
  return first.children;
});

const sourceText = computed(() => props.dialogueText || slotText.value);
const charDelay = computed(() =>
  Math.max(1, 1000 / Math.max(1, props.typingSpeedCps)),
);

const clearTimers = () => {
  if (timer.value !== null) {
    window.clearInterval(timer.value);
    timer.value = null;
  }
  if (finishTimer.value !== null) {
    window.clearTimeout(finishTimer.value);
    finishTimer.value = null;
  }
};

const finishDialogue = () => {
  if (hasFinished.value) return;
  hasFinished.value = true;
  emit("finished");
};

const startTyping = () => {
  clearTimers();
  hasFinished.value = false;
  displayText.value = "";

  lastClickTime = Date.now(); // start cooldown on dialogue start

  const text = sourceText.value;
  if (!text) return;

  let index = 0;
  timer.value = window.setInterval(() => {
    displayText.value += text[index];
    index += 1;

    if (index >= text.length) {
      if (timer.value !== null) {
        window.clearInterval(timer.value);
        timer.value = null;
      }
      finishTimer.value = window.setTimeout(finishDialogue, 5000);
    }
  }, charDelay.value);
};

const handleBoxClick = () => {
  // Debounce time to prevent clicks within 500 milliseconds of each other
  const now = Date.now();
  if (now - lastClickTime < 500) return;
  lastClickTime = now;

  if (displayText.value !== sourceText.value) {
    clearTimers();
    displayText.value = sourceText.value;
    finishTimer.value = window.setTimeout(finishDialogue, 2000);
    return;
  }

  clearTimers();
  finishDialogue();
};

watch(
  sourceText,
  () => {
    startTyping();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<style scoped></style>

