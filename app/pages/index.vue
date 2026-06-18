<template>
  <UiDashboardShell :title="message">
    <div
      class="overflow-x-auto flex h-full items-center gap-8 snap-x snap-mandatory scroll-smooth scrollbar-none px-4 py-8 sm:p-12"
    >
      <UiDashboardPortal
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
      </UiDashboardPortal>
    </div>
  </UiDashboardShell>
</template>

<script setup lang="ts">
import colors from "tailwindcss/colors";

definePageMeta({
  middleware: "authenticated",
});

const user = useUserStore();

const message = computed<string>(() => {
  const messages: string[] = ["Ready to fight?", "Locked in yet?"];
  return messages[Math.floor(Math.random() * messages.length)]!;
});

async function cardAction(action: string) {
  switch (action) {
    case "play":
      await navigateTo("/queue");
      break;
    case "collection":
      await navigateTo("/collection");
      break;
    case "logout":
      await user.supabase.auth.signOut();
      await navigateTo("/login");
      break;
  }
}

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
    action: "logout",
    title: "Log Out",
    subtitle: "Exit the game",
    buttonLabel: "Sign Out",
    accentColor: colors.green[400],
    shader: 3,
    icon: "pixelarticons:logout",
  },
];
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.scrollbar-none {
  scrollbar-width: none;
}
</style>
