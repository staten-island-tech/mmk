<template>
  <div class="flex">
    <button
      v-bind="$attrs"
      class="w-full px-4 py-2 border-4 border-double border-secondary-border bg-transparent text-md text-secondary-foreground transition-all duration-150 hover:border-secondary-hover hover:bg-secondary-hover hover:text-secondary-hover-foreground active:bg-secondary-hover active:border-secondary-hover active:text-secondary-hover-foreground active:scale-95"
    >
      {{ props.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
}>();
</script>

<style scoped></style>
