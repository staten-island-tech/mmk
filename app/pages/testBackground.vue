<script setup lang="ts">
import { ref } from 'vue'
import InfiniteVoid from '~/components/InfinityBackground.vue'
const voidActive = ref(false)
</script>

<template>
  <button @click="voidActive = true">Activate Infinite Void</button>
  <button @click="voidActive = false">Exit</button>

  <InfiniteVoid :active="voidActive" />
</template>