<template>
  <div
    class="flex flex-col gap-5 p-10 w-full max-w-lg border-double border-8 border-card-border ring-4 ring-card-ring ring-inset bg-card text-card-foreground shadow-transparent-lg"
  >
    <div class="flex flex-col gap-2">
      <p
        v-if="$slots.speaker"
        class="text-xs uppercase tracking-[0.4em] font-semibold text-primary"
      >
        <slot name="speaker" />
      </p>
      <p
        v-else-if="speaker"
        class="text-xs uppercase tracking-[0.4em] font-semibold text-primary"
      >
        {{ speaker }}
      </p>

      <div class="min-h-[5rem] text-base leading-7 whitespace-pre-wrap">
        <template v-if="sourceText">
          {{ displayText }}
        </template>
        <template v-else>
          <slot />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, useSlots } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
  speaker: {
    type: String,
    default: '',
  },
  dialogueText: {
    type: String,
    default: '',
  },
  typingSpeedCps: {
    type: Number,
    default: 25,
  },
  onFinished: {
    type: Function as PropType<() => void>,
    default: undefined,
  },
})

const emit = defineEmits<{
  (event: 'finished'): void
}>()

const slots = useSlots()
const displayText = ref('')
const timer = ref<number | null>(null)
const finishTimer = ref<number | null>(null)

const slotText = computed(() => {
  const content = slots.default?.()
  if (!content || content.length === 0) return ''
  const first = content[0]
  if (!first || typeof first.children !== 'string') return ''
  return first.children
})

const sourceText = computed(() => props.dialogueText || slotText.value)
const charDelay = computed(() => Math.max(1, 1000 / Math.max(1, props.typingSpeedCps)))

const clearTimers = () => {
  if (timer.value !== null) {
    window.clearInterval(timer.value)
    timer.value = null
  }
  if (finishTimer.value !== null) {
    window.clearTimeout(finishTimer.value)
    finishTimer.value = null
  }
}

const finishDialogue = () => {
  emit('finished')
  props.onFinished?.()
}

const startTyping = () => {
  clearTimers()
  displayText.value = ''

  const text = sourceText.value
  if (!text) return

  let index = 0
  timer.value = window.setInterval(() => {
    displayText.value += text[index]
    index += 1

    if (index >= text.length) {
      if (timer.value !== null) {
        window.clearInterval(timer.value)
        timer.value = null
      }
      finishTimer.value = window.setTimeout(() => {
        finishDialogue()
      }, 2000)
    }
  }, charDelay.value)
}

watch(sourceText, () => {
  startTyping()
}, { immediate: true })

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style scoped></style>
