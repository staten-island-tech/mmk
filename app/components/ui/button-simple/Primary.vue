<template>
  <button
    v-bind="$attrs"
    class="w-full px-4 py-2 border-4 border-double border-primary-border bg-primary text-md text-primary-foreground transition-all duration-150 hover:border-primary-hover hover:bg-primary-hover hover:text-primary-hover-foreground active:bg-primary-hover active:border-primary-hover active:text-primary-hover-foreground active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
  >
    {{ props.label }}
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
}>();
</script>

<style scoped></style>
