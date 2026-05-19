<template>
  <div class="h-screen w-screen flex flex-col bg-black overflow-hidden font-rajdhani">

    <div class="relative z-10 text-center py-4 border-b-2 border-yellow-400 bg-black">
      <h1 class="text-[13px] tracking-[10px] text-yellow-400 font-bold uppercase">MAIN MENU</h1>
      <p class="text-[10px] tracking-[5px] text-neutral-500 mt-1 uppercase">CHOOSE YOUR DESTINATION</p>
    </div>

    <div class="flex-1 flex items-center justify-center gap-6 px-8 py-8 bg-black overflow-x-auto snap-x snap-mandatory">
      <DshCard
        v-for="(card, i) in cards"
        :key="card.id"
        :config="card"
        :index="i"
        :is-last="i === cards.length - 1"
        class="w-[360px] h-[calc(100vh-148px)] min-h-[520px] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10"
      />
    </div>

    <div class="relative z-10 bg-black border-t border-neutral-900 flex items-center gap-3.5 px-6 py-2.5">
      <span class="text-[9px] tracking-[2px] text-yellow-400 font-bold uppercase">◆ Status</span>
      
      <div class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
        <span class="text-[9px] tracking-[2px] text-neutral-600 font-bold uppercase">Online</span>
      </div>

      <div class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
        <span class="text-[9px] tracking-[2px] text-neutral-600 font-bold uppercase">Rank</span>
        <span class="text-[10px] font-bold text-yellow-400 ml-0.5">S+</span>
      </div>

      <div class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
        <span class="text-[9px] tracking-[2px] text-neutral-600 font-bold uppercase">Stock</span>
        <span class="text-[10px] font-bold text-red-500 ml-0.5">3</span>
      </div>

      <div class="flex-1"></div>
      <span class="text-[9px] tracking-[2px] text-neutral-800 font-bold uppercase">ver 15.0.1</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import DshCard from '~/components/dshCard.vue'

export interface CardConfig {
  id: string
  label: string
  sub: string
  btnText: string
  accentColor: string
  textColor: string
  shader: 0 | 1 | 2 | 3
}

const cards: CardConfig[] = [
  { id: 'play',       label: 'Play',       sub: 'Battle',     btnText: 'Start Game',  accentColor: '#4a9eff', textColor: '#7dbeff', shader: 0 },
  { id: 'collection', label: 'Collection', sub: 'Cards',      btnText: 'View All',    accentColor: '#ff4a4a', textColor: '#ff8080', shader: 1 },
  { id: 'settings',   label: 'Settings',   sub: 'Options',    btnText: 'Configure',   accentColor: '#b44aff', textColor: '#cc80ff', shader: 2 },
  { id: 'logout',     label: 'Logout',     sub: 'Exit',       btnText: 'Sign Out',    accentColor: '#4aff8c', textColor: '#80ffb0', shader: 3 },
]
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');

.font-rajdhani {
  font-family: 'Rajdhani', 'Arial Black', sans-serif;
}
</style>