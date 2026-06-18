<template>
  <div class="flex justify-center items-center p-8 w-screen h-screen">
    <UiBackgroundDomain
      class="transition-all duration-1000"
      :style="{
        filter: `brightness(${backgroundBrightness})`,
      }"
    />
    <Transition name="slide-fade" mode="out-in">
      <div
        v-if="step >= 0"
        :key="step"
        class="z-10 flex flex-col justify-center items-center text-center gap-6"
      >
        <template v-if="step === 0">
          <h1>
            Welcome, {{ user.data?.user_metadata?.display_name ?? "Guest" }}.
          </h1>
        </template>

        <template v-else-if="step === 1">
          <h1>Let's prepare for your first battle.</h1>
        </template>

        <!-- Card draw -->
        <template v-else-if="step === 2">
          <h1>First, let's draw a starter card.</h1>
          <div class="flex gap-8 mt-4">
            <div
              v-for="n in 3"
              :key="n"
              class="cursor-pointer flex flex-col items-center gap-8"
              style="perspective: 750px"
              @click="flipCard(n)"
            >
              <div
                class="relative w-72 h-96 transition-all duration-300"
                :class="{
                  'hover:[transform:rotateX(10deg)_rotateY(-20deg)_scale(0.95)]':
                    flippedCard === null,
                  'cursor-not-allowed select-none brightness-50':
                    flippedCard && flippedCard !== n,
                }"
                :style="{
                  transformStyle: 'preserve-3d',
                  transform: flippedCard === n ? 'rotateY(180deg)' : undefined,
                }"
                @transitionend="onFlipEnd(n)"
              >
                <!-- Back -->
                <div class="absolute inset-0">
                  <UiCardSimple
                    class="flex justify-center items-center w-full h-full"
                  >
                    <span class="text-7xl text-slate-400">?</span>
                  </UiCardSimple>
                </div>

                <!-- Front -->
                <div
                  class="absolute inset-0 transition-all duration-1000"
                  :class="{ 'blur-md brightness-50': !revealed }"
                  :style="{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }"
                >
                  <UiCardSimple class="flex flex-col w-full h-full">
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

              <UiButtonSimplePrimary
                label="Accept"
                class="w-full transition-all duration-150"
                :class="
                  flippedCard === n && confirmedCard !== n && revealed
                    ? 'opacity-100 blur-none'
                    : 'opacity-0 blur-md pointer-events-none'
                "
                @click="confirmCard(n)"
              />
            </div>
          </div>
        </template>

        <template v-else-if="step === 3">
          <h1>Great draw. Let your journey begin.</h1>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "onboarding",
});

const user = useUserStore();

const backgroundBrightness = ref<number>(1);
const step = ref<number>(-1);

// Starter card selection step
const card = ref<Card | null>(null);
const flippedCard = ref<number | null>(null);
const confirmedCard = ref<number | null>(null);
const revealed = ref(false);

const advanceStep = ref<(() => void) | null>(null);

const steps: {
  duration?: number;
  onDemand?: boolean;
  callback?: () => any | Promise<any>;
}[] = [
  { duration: 3000, callback: () => (backgroundBrightness.value = 0.6) },
  { duration: 5000 },
  {
    onDemand: true,
    callback: async () => {
      await fetchRandomCard();
      backgroundBrightness.value = 0.4;
    },
  },
  { duration: 5000 },
];

async function fetchRandomCard() {
  const { data: drawnCard } = await $fetch<{ data: Card }>(
    "/api/onboarding/draw",
    {
      method: "POST",
    },
  );

  card.value = drawnCard;
}

function flipCard(n: number) {
  if (confirmedCard.value !== null) return;
  if (flippedCard.value !== null) return;
  flippedCard.value = n;
}

function onFlipEnd(n: number) {
  if (flippedCard.value === n) revealed.value = true;
}

async function confirmCard(n: number) {
  confirmedCard.value = n;
  advanceStep.value?.();
}

onMounted(async () => {
  for (const [i, { duration, callback, onDemand }] of steps.entries()) {
    step.value = i;
    if (callback) await callback();
    if (onDemand) {
      await new Promise<void>((resolve) => (advanceStep.value = resolve));
      advanceStep.value = null;
    } else await new Promise((resolve) => setTimeout(resolve, duration));
  }

  await $fetch("/api/onboarding/complete", { method: "POST" });
  navigateTo("/");
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
  @apply text-4xl text-blue-200 tracking-wider;
}
</style>
