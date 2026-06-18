<template>
  <div
    class="overflow-hidden flex flex-col p-4 w-full h-[100dvh] font-alt bg-zinc-300"
  >
    <header
      class="flex items-center justify-between gap-4 px-6 py-4 border-4 border-double border-card-border ring-4 ring-card-ring ring-inset bg-card shadow-transparent-lg"
    >
      <div class="flex items-center gap-4 min-w-0">
        <h1
          class="cursor-pointer text-2xl tracking-widest font-sans font-bold text-primary-foreground uppercase"
          @click="navigateTo('/')"
        >
          MMK
        </h1>

        <span
          class="hidden sm:block text-sm tracking-wider text-slate-500 uppercase truncate"
        >
          {{ props.title }}
        </span>
      </div>

      <div class="flex text-slate-500 gap-x-3 min-w-0 text-sm uppercase">
        <div class="flex items-center gap-2 min-w-0">
          <Icon name="pixelarticons:moon-star" class="text-pink-500" />
          <span class="truncate">
            {{ user.resonance ?? "--" }}
            resonance
          </span>
        </div>

        <div
          class="hidden min-[300px]:flex items-center gap-2 px-1.5 py-0.5 min-w-0 ring-2 ring-slate-300 bg-slate-200"
        >
          <Icon name="pixelarticons:user" class="text-slate-700" />
          <span class="font-bold normal-case truncate">{{
            user.data?.user_metadata?.display_name ?? "Guest"
          }}</span>
        </div>
      </div>
    </header>

    <main class="overflow-hidden relative flex-1 min-h-0">
      <slot />
    </main>

    <footer
      class="shrink-0 flex items-center gap-4 p-4 text-slate-500 border-4 border-double border-card-border ring-4 ring-card-ring ring-inset bg-card shadow-transparent-lg"
    >
      <div
        class="flex-1 min-w-0 grid grid-cols-[auto_auto] min-[570px]:flex min-[570px]:items-center gap-x-3 gap-y-1.5 text-sm uppercase"
      >
        <div class="flex items-center gap-2 min-w-0">
          <Icon
            name="pixelarticons:briefcase-account"
            class="text-red-500 shrink-0"
          />
          <span class="truncate">
            {{ user.cards?.length ?? "--" }}
            {{ user.cards?.length === 1 ? " card" : " cards" }}
          </span>
        </div>

        <div class="flex items-center gap-2 min-w-0">
          <Icon name="pixelarticons:gamepad" class="text-indigo-500 shrink-0" />
          <span class="truncate">
            {{ user.games ?? "--" }}
            {{ user.games === 1 ? "game" : "games" }}
          </span>
        </div>

        <div class="flex items-center gap-2 min-w-0">
          <Icon name="pixelarticons:trophy" class="text-emerald-500 shrink-0" />
          <span class="truncate">
            {{ user.wins ?? "--" }}
            {{ user.wins === 1 ? "win" : "wins" }}
            ({{
              user.games != null
                ? user.games === 0
                  ? "0"
                  : (((user.wins ?? 0) / user.games) * 100).toFixed(1)
                : "--"
            }}%)
          </span>
        </div>

        <div class="flex items-center gap-2 min-w-0">
          <Icon
            name="pixelarticons:cellular-signal-0"
            class="text-sky-500 shrink-0"
          />
          <span class="truncate">
            {{ user.rank ?? "--" }}
          </span>
        </div>
      </div>

      <button
        class="shrink-0 flex justify-center items-center p-1 rounded-sm ring-slate-300 transition-all"
        :class="
          !user.isLoading && user.isOnCooldown
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:ring-4 hover:bg-slate-300'
        "
        @click="user.fetchStats(true)"
      >
        <Icon
          v-if="user.isLoading"
          name="lucide:loader-circle"
          class="animate-spin"
        />

        <Icon v-else-if="user.isOnCooldown" name="pixelarticons:check" />

        <Icon v-else title="Force-reload stats" name="pixelarticons:reload" />
      </button>
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
