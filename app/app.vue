<template>
  <div>
    <NuxtLayout>
      <Transition name="default" mode="out-in">
        <NuxtPage />
      </Transition>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts"></script>

<style>
.default-enter-active,
.default-leave-active {
  transition: all 0.5s ease-in;
}

.default-enter-from {
  filter: brightness(0);
}

.default-leave-to {
  filter: brightness(0);
}
</style>
