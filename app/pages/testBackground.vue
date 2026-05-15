<script setup lang="ts">
import { ref } from 'vue'

import InfiniteVoid1 from '~/components/Domains/InfiniteVoid1.vue'
import InfiniteVoid2 from '~/components/Domains/InfiniteVoid2.vue'
import MalevolentHos from '~/components/Domains/MalevolentHos.vue'
import SpaceDefault from '~/components/Domains/SpaceDefault.vue'
import StarRage from '~/components/Domains/StarRage.vue'

const voidActive1 = ref(false)
const voidActive2 = ref(false)
const hosActive = ref(false)
const spaceActive = ref(false)
const starActive = ref(false)
</script>

<template>
  <div class="min-h-screen bg-black relative overflow-hidden">
    
    <!-- Background Layer -->
    <div class="absolute inset-0 z-0">
      <InfiniteVoid1 v-if="voidActive1" />
      <InfiniteVoid2 v-if="voidActive2" />
     
      <SpaceDefault v-if="spaceActive" />
      <StarRage v-if="starActive" />
    </div>
    <div class ="absolute inset-0 z-20">
       <MalevolentHos v-if="hosActive" />
    </div>

    <!-- Controls (on top) -->
    <div class="relative z-20 flex flex-col items-center py-8 gap-6">
      <h1 class="text-4xl font-bold text-primary">
        Test Background
      </h1>

      <div class="flex flex-wrap gap-3 justify-center px-4">
        <button 
          @click="voidActive1 = !voidActive1"
          class="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-hover transition">
          Toggle Infinite Void 1
        </button>

        <button 
          @click="voidActive2 = !voidActive2"
          class="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-hover transition">
          Toggle Infinite Void 2
        </button>

        <button 
          @click="hosActive = !hosActive"
          class="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-hover transition">
          Toggle Malevolent Hos
        </button>

        <button 
          @click="spaceActive = !spaceActive"
          class="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-hover transition">
          Toggle Space Default
        </button>

        <button 
          @click="starActive = !starActive"
          class="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-hover transition">
          Toggle Star Rage
        </button>
      </div>
    </div>
  </div>
</template>