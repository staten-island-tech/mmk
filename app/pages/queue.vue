<template>
  <div
    class="flex justify-center items-center p-4 w-screen h-screen bg-zinc-300"
  >
    <DomainBackground class="brightness-75" />
    <div
      class="z-10 flex flex-col justify-center items-center text-center gap-6"
    >
      <Icon
        name="pixelarticons:search"
        class="hover w-36 h-36 md:w-40 md:h-40 text-blue-400"
      />
      <h1 class="text-4xl md:text-5xl font-bold">
        <span class="px-2 text-red-300 rounded-l-lg bg-red-800">Match</span
        ><span class="px-2 text-blue-300 rounded-r-lg bg-blue-800">making</span>
      </h1>
      <h2 class="text-xl md:text-2xl tracking-wider text-blue-200">
        Searching for a worthy opponent<span class="dots"></span>
      </h2>
      <ButtonAccent
        label="Cancel"
        class="w-36"
        @click="navigateTo('/dashboard')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
</script>

<style scoped>
.hover {
  animation: float 2s cubic-bezier(0.15, 0.8, 0.5, 1) infinite;
}

.dots::after {
  content: "";
  animation: dots 2s infinite;
}

@keyframes float {
  0% {
    @apply text-blue-300;
    transform: translateX(15px) translateY(0);
  }

  33% {
    @apply text-red-300;
    transform: translateX(0) translateY(-30px);
  }

  67% {
    @apply text-purple-300;
    transform: translateX(-15px) translateY(0);
  }

  100% {
    @apply text-blue-300;
    transform: translateX(15px) translateY(0);
  }
}

@keyframes dots {
  0% {
    content: "";
  }

  25% {
    content: ".";
  }

  50% {
    content: "..";
  }

  75% {
    content: "...";
  }

  100% {
    content: "";
  }
}
</style>
