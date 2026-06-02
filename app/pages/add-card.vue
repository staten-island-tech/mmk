<template>
  <div>
    <select v-model="selectedCard">
      <option v-for="card in cards" :key="card.id" :value="card">
        {{ card.name }}
      </option>
    </select>
    <button @click="addCard">Add</button>
  </div>
</template>

<script setup lang="ts">
import type { Card } from "~/types/collection";

const config = useRuntimeConfig();

const selectedCard = ref<Card>();
const cards = ref<Card[]>([]);

async function addCard() {
  try {
    const response = await $fetch(`/api/match/finish`, {
      method: "POST",
      body: {
        card: selectedCard.value,
      },
    });
    console.log(response);
  } catch (error) {
    console.log("Error adding card: ", error);
  }
}

onMounted(async () => {
  cards.value = await $fetch(`${config.public.mmkPanelApi}/cards`);
});
</script>

<style scoped></style>
