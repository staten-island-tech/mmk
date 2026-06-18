<template>
  <UiDashboardShell title="Your Collection">
    <UiModalSimple
      :open="dialogOpen"
      :title="dialogTitle"
      @close="dialogOpen = false"
      :buttons="dialogButtons"
    >
      {{ dialogMessage }}
    </UiModalSimple>

    <div
      class="overflow-hidden flex flex-col gap-4 px-4 py-8 sm:p-12 h-full min-h-0"
    >
      <Transition name="warning" mode="out-in">
        <div
          v-if="(user.cards?.length ?? 0) > 0 && !user.battleCard"
          class="flex items-start gap-2 p-4 font-sans text-orange-900 border-4 border-double border-orange-900 bg-orange-100"
          style="
            background-image:
              linear-gradient(#f2dcc4 1px, transparent 1px),
              linear-gradient(90deg, #f2dcc4 1px, transparent 1px);
            background-size: 32px 32px;
          "
        >
          <Icon name="pixelarticons:alert" class="shrink-0 mt-0.5 text-xl" />
          <div class="lg:hidden overflow-hidden relative flex-1 fade-mask">
            <div class="whitespace-nowrap animate-marquee">
              <span class="inline-block pr-1">
                You have no battle card set. Future matches will use a randomly
                selected card from your collection. Consider setting one to make
                sure your strongest card always fights for you.
              </span>
              <span class="inline-block pr-1">
                You have no battle card set. Future matches will use a randomly
                selected card from your collection. Consider setting one to make
                sure your strongest card always fights for you.
              </span>
            </div>
          </div>
          <div class="hidden lg:block">
            You have no battle card set. Future matches will use a randomly
            selected card from your collection. Consider setting one to make
            sure your strongest card always fights for you.
          </div>
        </div>
      </Transition>

      <div
        class="overflow-hidden flex flex-col flex-1 p-4 sm:p-8 min-h-0 border-4 border-double border-card-border bg-slate-200"
        style="
          background-image:
            linear-gradient(#cbd5e1 1px, transparent 1px),
            linear-gradient(90deg, #cbd5e1 1px, transparent 1px);
          background-size: 128px 128px;
        "
      >
        <div
          v-if="loading"
          class="flex flex-col justify-center items-center text-center gap-4 w-full h-full"
        >
          <Icon
            name="lucide:loader-circle"
            class="text-slate-500 w-16 h-16 animate-spin"
          />
          <p class="text-slate-500 text-3xl font-sans font-medium">
            Loading your cards<span class="dots"></span>
          </p>
        </div>

        <div
          v-else-if="user.cards?.length === 0"
          class="flex flex-col justify-center items-center text-center gap-4 w-full h-full"
        >
          <Icon
            name="pixelarticons:mood-sad"
            class="text-slate-500 w-16 h-16"
          />
          <p class="text-slate-500 text-3xl font-sans font-medium">
            You don't own any cards yet.
          </p>
        </div>

        <template v-else>
          <div class="flex-1 flex flex-col items-center gap-6 w-full min-h-0">
            <div class="flex justify-center w-full lg:w-3/4">
              <UiFormInputSimple
                v-model="cardSearch"
                placeholder="Search for a card..."
                class="w-full font-sans"
              />
            </div>

            <div class="flex-1 w-full min-h-0">
              <div class="h-full overflow-y-auto p-2 sm:p-6">
                <div class="flex flex-wrap justify-center gap-12 w-full">
                  <UiCardSimple
                    v-for="card in filteredCards"
                    class="group/card relative flex flex-col w-[28rem] h-[30rem]"
                  >
                    <button
                      title="Set as battle card"
                      class="group/battle-card-button absolute top-4 right-4 flex justify-center items-center p-0 w-10 h-10 border-4 border-double transition-all duration-150 active:scale-90 group-hover/card:opacity-100"
                      :class="
                        card.reference_id === user.battleCard
                          ? 'border-primary-border bg-primary hover:bg-primary-hover'
                          : 'border-secondary-border bg-secondary hover:bg-secondary-hover opacity-0'
                      "
                      @click="setBattleCard(card.reference_id)"
                    >
                      <Icon
                        name="pixelarticons:trophy"
                        class="w-5 h-5 transition-all duration-150"
                        :class="
                          card.reference_id === user.battleCard
                            ? 'text-primary-foreground group-hover/battle-card-button:text-primary-hover-foreground'
                            : 'text-secondary-foreground group-hover/battle-card-button:text-secondary-hover-foreground'
                        "
                      />
                    </button>

                    <div
                      class="flex-1 flex justify-center items-center p-8 w-full bg-slate-300"
                    >
                      <img :src="card.defaultSprite" class="h-24" />
                    </div>

                    <div
                      class="flex flex-col items-center text-center w-full h-full min-h-0"
                    >
                      <div
                        class="p-2 text-center w-full border-t-2 border-card-border"
                        :style="{
                          'background-color': card.rarity.plateColor,
                        }"
                      >
                        <h2 class="text-xl font-bold uppercase">
                          {{ card.rarity.name }}
                        </h2>
                      </div>

                      <div
                        class="flex flex-col items-center p-2 w-full border-y-2 border-card-border bg-slate-200"
                      >
                        <h3 class="text-2xl font-bold">{{ card.name }}</h3>
                        <h3 class="text-lg font-semibold uppercase">
                          {{ card.nickname }}
                        </h3>
                      </div>

                      <div
                        class="flex-1 flex flex-col justify-between w-full min-h-0 p-1"
                      >
                        <p
                          class="overflow-y-auto flex-1 p-2 min-h-0 ring-4 ring-card-ring"
                        >
                          {{ card.description }}
                        </p>

                        <div
                          class="flex justify-between items-center gap-2 px-4 py-2 text-xl font-medium border-t-4 border-card-ring bg-slate-200"
                        >
                          <span class="flex items-center gap-2 text-red-600">
                            <Icon name="pixelarticons:heart" />
                            <span>
                              {{ card.health }}
                              <span class="hidden sm:inline">HP</span>
                            </span>
                          </span>

                          <span
                            v-if="card.obtained_at"
                            class="text-sm text-slate-500"
                          >
                            {{ new Date(card.obtained_at).toLocaleString() }}
                          </span>

                          <span class="flex items-center gap-2 text-blue-600">
                            <Icon name="pixelarticons:shield" />
                            <span>
                              {{ card.defense }}
                              <span class="hidden sm:inline">DEF</span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </UiCardSimple>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </UiDashboardShell>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "authenticated",
});

const user = useUserStore();

const loading = ref(true);

const dialogOpen = ref<boolean>(false);
const dialogTitle = ref<string>("");
const dialogMessage = ref<string>("");
const dialogButtons = ref<DialogButton[]>([
  {
    label: "OK",
    priority: 1,
    callback: () => (dialogOpen.value = false),
  },
]);

const cardSearch = ref<string>("");

const filteredCards = computed(() => {
  const query = cardSearch.value.trim().toLowerCase();
  if (!query) return user.cards ?? [];

  return (user.cards ?? []).filter((card) => {
    return (
      card.name?.toLowerCase().includes(query) ||
      card.nickname?.toLowerCase().includes(query) ||
      card.description?.toLowerCase().includes(query)
    );
  });
});

async function loadCards() {
  loading.value = true;

  try {
    await user.fetchStats();
  } catch {
    dialogTitle.value = "Error Fetching Stats";
    dialogMessage.value = "Could not retrieve your stats. Please try again.";
    dialogOpen.value = true;
    dialogButtons.value = [
      {
        label: "Retry",
        priority: 1,
        callback: async () => {
          dialogOpen.value = false;
          await loadCards();
        },
      },
      {
        label: "Cancel",
        priority: 2,
        callback: () => navigateTo("/"),
      },
    ];
    return;
  } finally {
    loading.value = false;
  }
}

async function setBattleCard(referenceId: string) {
  try {
    const current = user.battleCard;
    const isSame = current === referenceId;
    const payload = isSame ? null : referenceId;

    await $fetch("/api/user/primary-card", {
      method: "POST",
      body: { id: payload },
    });

    user.battleCard = payload;

    await user.fetchStats(true);
  } catch (e: any) {
    dialogTitle.value = "Error Setting Battle Card";
    dialogMessage.value = e.statusMessage;
    dialogOpen.value = true;
  }
}

onMounted(() => {
  loadCards();
});
</script>

<style scoped>
.warning-enter-active,
.warning-leave-active {
  transition: all 0.4s ease;
}

.warning-enter-from,
.warning-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  filter: blur(10px);
}

.warning-enter-to,
.warning-leave-from {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.dots::after {
  content: "";
  animation: dots 1s infinite;
}

.animate-marquee {
  display: inline-flex;
  width: max-content;
  animation: marquee 20s linear infinite;
}

.fade-mask {
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 5%,
    black 95%,
    transparent
  );

  mask-image: linear-gradient(
    to right,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
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

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
