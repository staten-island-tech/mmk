<template>
  <div
    class="overflow-hidden flex flex-col p-4 w-screen h-screen font-alt bg-zinc-300"
  >
    <header
      class="flex items-center justify-between gap-4 px-6 py-4 border-4 border-double border-card-border ring-4 ring-card-ring ring-inset bg-card shadow-transparent-lg"
    >
      <div class="flex items-center gap-4">
        <!-- Too lazy to make a custom logo image -->
        <span
          class="text-2xl tracking-widest font-sans font-bold text-primary-foreground uppercase"
        >
          MMK
        </span>

        <!-- No clue what else to put here ... sorry -->
        <span
          class="hidden sm:block text-sm tracking-widest text-slate-500 uppercase"
        >
          {{ message }}
        </span>
      </div>

      <div class="flex items-center gap-2 text-sm text-slate-500">
        <Icon name="pixelarticons:user" class="w-4 h-4 font-slate-500" />
        <div>
          Logged in as
          <span class="font-bold">{{ user?.user_metadata?.display_name }}</span>
        </div>
      </div>
    </header>

    <!-- Portals -->
    <main ref="mainRef" class="relative flex-1 overflow-hidden">
      <div
        class="flex h-full items-center gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none p-12"
      >
        <DashboardCard
          v-for="card in cards"
          :key="card.action"
          :config="card"
          class="flex-1 min-w-80 snap-center"
          @action="cardAction"
        >
          <template #icon>
            <Icon
              :name="card.icon"
              class="w-8 h-8"
              :style="{ color: card.accentColor }"
            />
          </template>
        </DashboardCard>
      </div>
    </main>

    <footer
      class="shrink-0 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6 md:py-4 border-4 border-double border-card-border ring-4 ring-card-ring ring-inset bg-card shadow-transparent-lg"
    >
      <div class="flex items-center gap-2 text-sm uppercase text-slate-500">
        <Icon
          name="pixelarticons:briefcase-account"
          class="w-4 h-4 text-red-500"
        />
        {{ userCards.length }} cards
      </div>

      <div class="flex items-center gap-2 text-sm uppercase text-slate-500">
        <Icon name="pixelarticons:gamepad" class="w-4 h-4 text-indigo-500" />
        {{ userGames }} games
      </div>

      <div class="flex items-center gap-2 text-sm uppercase text-slate-500">
        <Icon name="pixelarticons:trophy" class="w-4 h-4 text-emerald-500" />
        {{ userWins }} wins
      </div>

      <div class="flex items-center gap-2 text-sm uppercase text-slate-500">
        <Icon
          name="pixelarticons:cellular-signal-0"
          class="w-4 h-4 text-sky-500"
        />
        {{ userRank }}
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import colors from "tailwindcss/colors";
import type { UserStats } from "~/types/user";

const supabase = useSupabaseClient();
const user = useSupabaseUser();

/** The number of wins the user has. (int32) */
const userWins = ref<number>(0);
/** The number of games the user has played. (int32) */
const userGames = ref<number>(0);
/** The array of cards the user owns. (int32[]) */
const userCards = ref<number[]>([]);

/** The user's rank. */
const userRank = computed<string>(() => {
  // TODO: Determine the rank of the user based on the highest rarity card the user owns
  return "Grade I"; // just a placeholder for now
});

async function cardAction(action: string) {
  switch (action) {
    // TODO: Add all cases here
    case "play":
      await navigateTo("/queue");
      break;
    case "logout":
      await supabase.auth.signOut();
      await navigateTo("/login");
      break;
    default:
      break;
  }
}

const message = computed<string>(() => {
  const messages: string[] = [
    "Ready to fight?",
    "Locked in yet?",
    "Choose a portal!",
  ];
  return messages[Math.floor(Math.random() * messages.length)]!;
});

const cards = [
  {
    action: "play",
    title: "Play",
    subtitle: "Battle an opponent",
    buttonLabel: "Start Game",
    accentColor: colors.sky[400],
    shader: 0,
    icon: "pixelarticons:play",
  },
  {
    action: "collection",
    title: "Collection",
    subtitle: "View your cards",
    buttonLabel: "View All",
    accentColor: colors.red[400],
    shader: 1,
    icon: "pixelarticons:briefcase-search",
  },
  {
    action: "settings",
    title: "Settings",
    subtitle: "Change your settings",
    buttonLabel: "Configure",
    accentColor: colors.purple[400],
    shader: 2,
    icon: "pixelarticons:sliders",
  },
  {
    action: "logout",
    title: "Log Out",
    subtitle: "Exit the game",
    buttonLabel: "Sign Out",
    accentColor: colors.green[400],
    shader: 3,
    icon: "pixelarticons:logout",
  },
];

onMounted(async () => {
  try {
    const { data: stats }: { data: UserStats } = await $fetch("/api/stats", {
      method: "GET",
    });

    userWins.value = stats.wins;
    userGames.value = stats.games;
    userCards.value = stats.cards;
  } catch (e: any) {
    console.log(e);
  }
});
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.scrollbar-none {
  scrollbar-width: none;
}
</style>
