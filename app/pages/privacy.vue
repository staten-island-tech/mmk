<template>
  <div class="w-screen h-screen p-8">
    <ContentRenderer
      v-if="data"
      :value="data"
      class="prose prose-neutral max-w-none font-system"
    />
    <div v-else class="flex justify-center items-center w-screen h-screen">
      <Icon name="lucide:loader-circle" class="w-8 h-8 animate-spin" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useAsyncData("privacy", () => {
  return queryCollection("content").path("/privacy").first();
});

useSeoMeta({
  title: data.value?.title ?? "Privacy Policy",
  description:
    data.value?.description ??
    "Our privacy policy and data handling practices.",
});
</script>

<style scoped></style>
