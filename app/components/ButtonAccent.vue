<template>
  <div class="flex">
    <button
      v-bind="$attrs"
      class="w-full px-4 py-2 border-4 border-double border-accent-border bg-accent text-md text-accent-foreground transition-all duration-150 hover:border-accent-hover hover:bg-accent-hover hover:text-accent-hover-foreground active:bg-accent-hover active:border-accent-hover active:text-accent-hover-foreground active:scale-95"
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
