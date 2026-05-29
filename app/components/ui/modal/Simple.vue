<template>
  <Transition name="backdrop">
    <div
      v-show="open"
      class="z-50 fixed flex justify-center items-center left-0 top-0 w-full h-full bg-black/50"
    >
      <Transition name="card" appear>
        <div
          v-if="open"
          class="relative flex flex-col gap-5 p-8 w-full max-w-xl border-solid border-4 border-card-border bg-card text-card-foreground"
        >
          <Icon
            name="pixelarticons:close"
            class="cursor-pointer absolute top-5 right-5 w-5 h-5"
            @click="emit('close')"
          />

          <!-- Heading text -->
          <h1 class="text-2xl font-semibold">{{ title }}</h1>

          <!-- Content -->
          <slot />

          <!-- Button row -->
          <div v-if="props.buttons" class="flex flex-row-reverse gap-5">
            <template v-for="button in props.buttons" :key="button.label">
              <!-- Primary button -->
              <ButtonPrimary
                v-if="button.priority === 1"
                :label="button.label"
                class="min-w-24"
                @click="button.callback"
              />

              <!-- Secondary button -->
              <ButtonSecondary
                v-else-if="button.priority === 2"
                :label="button.label"
                class="min-w-24"
                @click="button.callback"
              />
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { DialogButton } from "~/types/dialog";

const props = defineProps<{
  open: boolean;
  title: string;
  buttons: DialogButton[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.card-enter-active {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.card-leave-active {
  transition: transform 0.2s ease-in;
}
.card-enter-from,
.card-leave-to {
  transform: scale(0.85);
}
</style>
