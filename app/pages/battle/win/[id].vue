<template>
  <div class="flex justify-center items-center p-8 w-full h-[100dvh]">
    <UiBackgroundDomain
      class="transition-all duration-1000"
      :style="{
        filter: `brightness(${backgroundBrightness})`,
      }"
    />

    <UiModalSimple
      :open="dialogOpen"
      :title="dialogTitle"
      :close-button="false"
      :buttons="dialogButtons"
      @close="dialogOpen = false"
    >
      {{ dialogMessage }}
    </UiModalSimple>

    <Transition name="slide-fade" mode="out-in">
      <div
        v-if="step >= 0"
        :key="step"
        class="z-10 overflow-y-auto flex flex-col justify-center items-center text-center gap-6"
      >
        <template v-if="step === 0">
          <h1>
            You did well,
            {{ user.data?.user_metadata?.display_name ?? "Guest" }}.
          </h1>
        </template>

        <template v-else-if="step === 1">
          <h1>Let's see what you've earned.</h1>
        </template>

        <!-- Card reveal -->
        <template v-else-if="step === 2">
          <h1 v-if="isDuplicate">
            A familiar face appears. You pulled a card you already own! Better
            luck next time.
          </h1>
          <h1 v-else>
            A new fragment joins your tapestry. You unlocked a new card! May its
            power rest in your hands.
          </h1>
          <div class="flex gap-8 mt-4">
            <div
              class="flex flex-col items-center gap-8"
              style="perspective: 750px"
            >
              <div class="relative w-[70vw] md:w-80 h-96 transition-all duration-300">
                <div
                  class="absolute inset-0 transition-all duration-1000"
                  :class="{ 'blur-md brightness-50': !revealed }"
                >
                  <UiCardSimple class="flex flex-col h-full">
                    <!-- Sprite -->
                    <div
                      class="shrink-0 flex justify-center items-center p-4 w-full h-2/5 bg-slate-300"
                    >
                      <img :src="card?.defaultSprite" class="max-h-full" />
                    </div>

                    <div
                      class="flex-3 flex flex-col items-center text-center w-full min-h-0"
                    >
                      <!-- Rarity plate -->
                      <div
                        class="text-center p-1 w-full border-t-2 border-card-border"
                        :style="{
                          'background-color': card?.rarity.plateColor,
                        }"
                      >
                        <h2 class="text-sm font-bold uppercase">
                          {{ card?.rarity.name }}
                        </h2>
                      </div>

                      <!-- Name -->
                      <div
                        class="flex flex-col items-center p-2 w-full border-y-2 border-card-border bg-slate-200"
                      >
                        <h3 class="text-base font-bold">{{ card?.name }}</h3>
                        <h3 class="text-xs font-semibold uppercase">
                          {{ card?.nickname }}
                        </h3>
                      </div>

                      <!-- Description -->
                      <p
                        class="overflow-y-auto m-1 p-2 w-auto min-h-0 text-xs ring-4 ring-card-ring text-left"
                      >
                        {{ card?.description }}
                      </p>

                      <!-- Stats -->
                      <div
                        class="flex justify-between items-center px-3 py-1 text-sm font-medium bg-slate-200 w-full"
                      >
                        <span class="flex items-center gap-1 text-red-600">
                          <Icon name="pixelarticons:heart" />
                          {{ card?.health }} HP
                        </span>
                        <span class="flex items-center gap-1 text-blue-600">
                          <Icon name="pixelarticons:shield" />
                          {{ card?.defense }} DEF
                        </span>
                      </div>
                    </div>
                  </UiCardSimple>
                </div>
              </div>
            </div>
          </div>
          <UiButtonSimplePrimary
            label="Continue"
            class="!w-[70vw] md:!w-80"
            @click="advanceStep?.()"
          />
        </template>

        <template v-else-if="step === 3">
          <h1>Your journey continues.</h1>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "authenticated",
});

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

const user = useUserStore();
const route = useRoute();
const matchId = route.params.id as string;

const backgroundBrightness = ref<number>(1);
const step = ref<number>(-1);

// Card reveal step
const card = ref<Card | null>(null);
const revealed = ref<boolean>(false);
const isDuplicate = ref<boolean>(false);

const advanceStep = ref<(() => void) | null>(null);

const steps: {
  duration?: number;
  onDemand?: boolean;
  callback?: () => any | Promise<any>;
}[] = [
  { duration: 3000, callback: () => (backgroundBrightness.value = 0.6) },
  { duration: 4000 },
  {
    onDemand: true,
    callback: async () => {
      revealed.value = false;
      backgroundBrightness.value = 0.4;

      await nextTick();

      setTimeout(() => (revealed.value = true), 500);
    },
  },
  { duration: 4000 },
];

onMounted(async () => {
  try {
    const result = await $fetch<{
      // fetch reward first
      success?: boolean;
      duplicateCard?: boolean;
      card?: Card;
      alreadyRewarded?: boolean;
    }>("/api/battle/reward", {
      method: "POST",
      body: { matchId },
    });

    if (result.alreadyRewarded) throw Error("Already rewarded for this match.");
    if (result.success && result.card) card.value = result.card;
    if (result.duplicateCard) isDuplicate.value = true;

    await user.fetchStats(true); // force refresh

    for (const [i, { duration, callback, onDemand }] of steps.entries()) {
      step.value = i;
      if (callback) await callback();
      if (onDemand) {
        await new Promise<void>((resolve) => (advanceStep.value = resolve));
        advanceStep.value = null;
      } else await new Promise((resolve) => setTimeout(resolve, duration));
    }

    navigateTo("/");
  } catch (e: any) {
    dialogTitle.value = "Error Claiming Reward";
    dialogMessage.value =
      e?.data?.statusMessage || e?.message || "Something went wrong.";
    dialogButtons.value = [
      {
        label: "Return Home",
        priority: 1,
        callback: () => navigateTo("/"),
      },
    ];
    dialogOpen.value = true;
  }
});
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  filter: blur(12px);
  transform: translateY(-50px);
}

.slide-fade-leave-to {
  opacity: 0;
  filter: blur(12px);
  transform: translateY(50px);
}

h1 {
  @apply text-2xl md:text-3xl text-blue-200 tracking-wider;
}
</style>
