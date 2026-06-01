<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts"></script>

<style>
.default-enter-active,
.default-leave-active {
  transition: all 0.25s ease-in;
}

.default-enter-from {
  filter: brightness(0);
}

.default-leave-to {
  filter: brightness(0);
}
</style>
