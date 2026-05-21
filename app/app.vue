<template>
  <div>
    <NuxtLayout>
      <Transition :name="transitionName" mode="out-in">
        <NuxtPage />
      </Transition>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const transitionName = useState("default-transition-name", () => "default");
</script>

<style>
.default-enter-active,
.default-leave-active {
  transition: all 0.5s ease-in;
}

.default-enter-from {
  opacity: 0;
}

.default-leave-to {
  opacity: 0;
}

.auth-enter-active,
.auth-leave-active {
  transition: all 0.2s ease;
}

.auth-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: scale(0.95);
}

.auth-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: scale(1.05);
}
</style>
