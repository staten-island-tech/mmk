<template>
  <NuxtLink
    class="text-link transition-all duration-150 hover:text-link-hover"
    :to="props.to"
  >
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  to: string;
}>();
</script>

<style scoped></style>
