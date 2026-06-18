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

    <main class="overflow-hidden relative flex-1 min-h-0">
      <slot />
    </main>

    <footer
      class="shrink-0 flex flex-wrap justify-between items-center p-4 text-slate-500 border-4 border-double border-card-border ring-4 ring-card-ring ring-inset bg-card shadow-transparent-lg"
    >
      <div
        class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm uppercase"
      >
        <div class="flex items-center gap-2">
          <Icon
            name="pixelarticons:briefcase-account"
            class="w-4 h-4 text-red-500"
          />
          <span>
            {{ user.cards?.length ?? "--" }}
            <span class="hidden sm:inline">
              {{ user.cards?.length === 1 ? " card" : " cards" }}
            </span>
          </span>
        </div>

        <div class="flex items-center gap-2">
          <Icon name="pixelarticons:gamepad" class="w-4 h-4 text-indigo-500" />
          <span>
            {{ user.games ?? "--" }}
            <span class="hidden sm:inline">{{
              user.games === 1 ? "game" : "games"
            }}</span>
          </span>
        </div>

        <div class="flex items-center gap-2">
          <Icon name="pixelarticons:trophy" class="w-4 h-4 text-emerald-500" />
          <span>
            {{ user.wins ?? "--" }}
            <span class="hidden sm:inline">
              {{ user.wins === 1 ? "win" : "wins" }}
              ({{
                user.games != null
                  ? user.games === 0
                    ? "0"
                    : (((user.wins ?? 0) / user.games) * 100).toFixed(1)
                  : "--"
              }}%)
            </span>
          </span>
        </div>

        <div class="flex items-center gap-2">
          <Icon
            name="pixelarticons:cellular-signal-0"
            class="w-4 h-4 text-sky-500"
          />
          {{ user.rank ?? "--" }}
        </div>
      </div>

      <button
        class="flex justify-center items-center p-1 rounded-sm ring-slate-300 transition-all"
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
          class="w-4 h-4 animate-spin"
        />

        <Icon
          v-else-if="user.isOnCooldown"
          name="pixelarticons:check"
          class="w-4 h-4"
        />

        <Icon
          v-else
          title="Force-reload stats"
          name="pixelarticons:reload"
          class="w-4 h-4"
        />
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
