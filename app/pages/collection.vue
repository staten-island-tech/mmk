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

    <div class="flex flex-col gap-4 p-12 h-full">
      <div
        class="overflow-y-auto flex flex-wrap justify-center h-full gap-12 border-4 border-double border-card-border bg-slate-200 p-8"
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
          <UiCardSimple
            v-for="card in user.cards"
            class="flex flex-col w-[28rem] h-[34rem]"
          >
            <div
              class="flex-1 flex justify-center items-center p-8 w-full min-h-48 bg-slate-300"
            >
              <img :src="card.defaultSprite" class="max-h-40" />
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
                  class="flex justify-between items-center px-4 py-2 text-xl font-medium border-t-4 border-card-ring bg-slate-200"
                >
                  <span class="flex items-center gap-2 text-red-600">
                    <Icon name="pixelarticons:heart" />
                    {{ card.health }} HP
                  </span>

                  <span v-if="card.obtained_at" class="text-sm text-slate-500">
                    {{ new Date(card.obtained_at).toLocaleString() }}
                  </span>

                  <span class="flex items-center gap-2 text-blue-600">
                    <Icon name="pixelarticons:shield" />
                    {{ card.defense }} DEF
                  </span>
                </div>
              </div>
            </div>
          </UiCardSimple>
        </template>
      </div>
    </div>
  </UiDashboardShell>
</template>

<script setup lang="ts">
import type { DialogButton } from "~/types/dialog";

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

async function loadCards() {
  loading.value = true;

  try {
    await user.fetchStats();
  } catch (_) {
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

onMounted(() => {
  loadCards();
});
</script>

<style scoped>
.dots::after {
  content: "";
  animation: dots 1s infinite;
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
