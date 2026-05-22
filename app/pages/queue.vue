<template>
  <div class="h-screen w-screen overflow-hidden bg-black font-rajdhani relative">
    <!-- Top Bar -->
       <SpaceDefault/>

    <div class="relative z-20 text-center py-6 border-b border-yellow-400/30 bg-black/70 backdrop-blur-xl">
      <h1 class="text-[15px] tracking-[12px] text-yellow-400 font-bold uppercase">MMK</h1>
    </div>

    <!-- Main Content -->
    <div class="relative z-20 flex-1 flex flex-col items-center justify-center gap-12">
      <!-- Central Visual -->
      <div class="relative flex flex-col items-center">
        <div class="relative w-[460px] h-[460px] flex items-center justify-center">
          <!-- Outer Ring -->
          <div class="absolute w-[440px] h-[440px] border border-yellow-400/20 rounded-full"></div>
          <div class="absolute w-[360px] h-[360px] border border-yellow-400/30 rounded-full animate-[spin_25s_linear_infinite]"></div>
          
          <!-- Inner Glow -->
          <div class="absolute w-[220px] h-[220px] bg-yellow-400/10 rounded-full blur-3xl"></div>
          
          <!-- Fighter Core -->
          <div class="relative text-[160px] text-yellow-400/10 font-black select-none leading-none">
            ⚔️
          </div>

          <!-- Scanning Effect -->
          <div class="absolute inset-0 border border-yellow-400/40 rounded-full animate-ping-slow"></div>
        </div>
      </div>

      <!-- Queuing Text -->
      <div class="text-center">
        <div class="text-yellow-400 text-3xl font-bold tracking-[8px] uppercase mb-3">
          QUEUING
        </div>
        <div class="text-neutral-400 text-sm tracking-[4px] font-light">
          SEARCHING FOR WORTHY OPPONENT
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="w-96">
        <div class="h-[3px] bg-neutral-900 rounded-full overflow-hidden">
          <div 
            class="h-full w-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 animate-progress"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="relative z-20 flex justify-center pb-12">
      <button 
        @click="cancelSearch"
        class="group px-12 py-4 border border-red-500/70 hover:border-red-500 text-red-400 hover:text-red-300 font-bold tracking-[3px] text-sm uppercase transition-all flex items-center gap-3 hover:bg-red-500/5 rounded-xl"
      >
        <span class="text-xl group-active:rotate-90 transition-transform">✕</span>
        BACK
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SpaceDefault from '~/components/Domains/SpaceDefault.vue'

function cancelSearch() {
  // router.push back to dashboard or emit event
  alert("Returning to dashboard...")
}
</script>


<style scoped>
.font-rajdhani {
  font-family: 'Rajdhani', system-ui, sans-serif;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes ping-out {
  0%   { transform: scale(0.9); opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0px rgba(245,196,60,0); }
  50%       { box-shadow: 0 0 24px 4px rgba(245,196,60,0.18); }
}

@keyframes dot-pulse {
  0%, 100% { background: rgba(245,196,60,0.15); transform: scale(1); }
  50%       { background: rgba(245,196,60,0.7);  transform: scale(1.3); }
}

@keyframes progress-sweep {
  0%   { width: 10%; margin-left: 0; }
  100% { width: 55%; margin-left: 40%; }
}

</style>