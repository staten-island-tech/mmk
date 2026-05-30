<template>
  <UiDashboardShell title="Your Collection">
    <div class="flex flex-col gap-4 p-12 h-full">
      <div
        class="overflow-y-auto flex flex-wrap justify-center h-full gap-12 border-4 border-double border-card-border bg-slate-200 p-8"
      >
        <UiCardSimple
          v-for="number in Array(56).fill(0)"
          class="flex flex-col w-full h-[34rem]"
        >
          <!-- Thumbnail -->
          <div class="flex justify-center p-4 w-full bg-slate-300">
            <img src="/favicon.ico" class="h-48" />
          </div>

          <!-- Information -->
          <div
            class="flex flex-col items-center text-center w-full h-full min-h-0"
          >
            <!-- Rarity -->
            <div
              class="p-2 text-center w-full border-t-2 border-card-border bg-blue-100"
            >
              <h2 class="text-xl font-bold uppercase">Special Grade</h2>
            </div>

            <!-- Nameplate -->
            <div
              class="flex flex-col items-center p-2 w-full border-y-2 border-card-border bg-slate-200"
            >
              <h3 class="text-2xl font-bold">John Appleseed</h3>
              <h3 class="text-lg font-semibold uppercase">"Appleseed"</h3>
            </div>

            <!-- Attributes -->
            <div
              class="flex-1 flex flex-col justify-between w-full min-h-0 p-1"
            >
              <p
                class="overflow-y-auto flex-1 p-2 min-h-0 ring-4 ring-card-ring"
              >
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
                faucibus ex sapien vitae pellentesque sem placerat. In id cursus
                mi pretium tellus duis convallis. Tempus leo eu aenean sed diam
                urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum
                egestas. Iaculis massa nisl malesuada lacinia integer nunc
                posuere. Ut hendrerit semper vel class aptent taciti sociosqu.
                Ad litora torquent per conubia nostra inceptos himenaeos.
              </p>

              <div
                class="flex justify-between items-center px-4 py-2 text-xl font-medium border-t-4 border-card-ring bg-slate-200"
              >
                <!-- Health -->
                <span class="flex items-center gap-2 text-red-600">
                  <Icon name="pixelarticons:heart" />
                  100
                  HP
                </span>

                <!-- Defense -->
                <span class="flex items-center gap-2 text-blue-600">
                  <Icon name="pixelarticons:shield" />
                  50
                  DEF
                </span>
              </div>
            </div>
          </div>
        </UiCardSimple>
      </div>
    </div>
  </UiDashboardShell>
</template>

<script setup lang="ts"></script>

<style scoped></style>
