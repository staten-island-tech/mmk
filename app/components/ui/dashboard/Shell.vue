<template>
  <div
    class="overflow-hidden flex flex-col p-4 w-screen h-screen font-alt bg-zinc-300"
  >
    <header
      class="flex items-center justify-between gap-4 px-6 py-4 border-4 border-double border-card-border ring-4 ring-card-ring ring-inset bg-card shadow-transparent-lg"
    >
      <div class="flex items-center gap-4">
        <h1
          class="cursor-pointer text-2xl tracking-widest font-sans font-bold text-primary-foreground uppercase"
          @click="navigateTo('/')"
        >
          MMK
        </h1>

        <span
          class="hidden sm:block text-sm tracking-widest text-slate-500 uppercase"
        >
          {{ props.title }}
        </span>
      </div>

      <div class="flex items-center gap-2 text-sm text-slate-500">
        <Icon name="pixelarticons:user" class="w-4 h-4 font-slate-500" />
        <div>
          Logged in as
          <span class="font-bold">{{
            user.data?.user_metadata?.display_name ?? "Guest"
          }}</span>
        </div>
      </div>
    </header>

    <main class="relative flex-1 overflow-hidden">
      <slot />
    </main>

    <footer
      class="shrink-0 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6 md:py-4 border-4 border-double border-card-border ring-4 ring-card-ring ring-inset bg-card shadow-transparent-lg"
    >
      <div class="flex items-center gap-2 text-sm uppercase text-slate-500">
        <Icon
          name="pixelarticons:briefcase-account"
          class="w-4 h-4 text-red-500"
        />
        {{ user.cards.length }} cards
      </div>

      <div class="flex items-center gap-2 text-sm uppercase text-slate-500">
        <Icon name="pixelarticons:gamepad" class="w-4 h-4 text-indigo-500" />
        {{ user.games }} games
      </div>

      <div class="flex items-center gap-2 text-sm uppercase text-slate-500">
        <Icon name="pixelarticons:trophy" class="w-4 h-4 text-emerald-500" />
        {{ user.wins }} wins
      </div>

      <div class="flex items-center gap-2 text-sm uppercase text-slate-500">
        <Icon
          name="pixelarticons:cellular-signal-0"
          class="w-4 h-4 text-sky-500"
        />
        {{ user.rank }}
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const user = useUserStore();

const props = defineProps<{
  title?: string;
}>();

onMounted(async () => {
  await user.fetchStats();
});
</script>

<style scoped></style>
