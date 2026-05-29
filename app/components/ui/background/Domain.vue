<template>
  <div class="fixed inset-0 overflow-hidden bg-domain-bg" aria-hidden="true">
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none [image-rendering:pixelated] [shape-rendering:crispEdges]"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="pixel-grid"
          x="0"
          y="0"
          width="2"
          height="2"
          patternUnits="userSpaceOnUse"
        >
          <rect width="2" height="2" fill="none" />
          <rect width="1" height="1" class="fill-domain-accent/3" />
        </pattern>
        <pattern
          id="scanlines"
          x="0"
          y="0"
          width="1"
          height="0.8"
          patternUnits="userSpaceOnUse"
        >
          <rect
            width="1"
            height="0.4"
            class="fill-domain-overlay-scanline/15"
          />
        </pattern>
      </defs>

      <rect width="100" height="100" fill="url(#pixel-grid)" />

      <g
        transform="translate(50, 50)"
        class="origin-center animate-domain-slow-rotate"
      >
        <rect
          x="-9"
          y="-9"
          width="18"
          height="18"
          class="stroke-domain-accent-ring/18 stroke-[0.4] fill-none animate-domain-ring-breathe [animation-delay:var(--delay)] [shape-rendering:crispEdges]"
          :style="{ '--delay': '0s' }"
        />
        <rect
          x="-17"
          y="-17"
          width="34"
          height="34"
          class="stroke-domain-accent-ring/18 stroke-[0.4] fill-none animate-domain-ring-breathe [animation-delay:var(--delay)] [shape-rendering:crispEdges]"
          :style="{ '--delay': '1.5s' }"
        />
        <rect
          x="-26"
          y="-26"
          width="52"
          height="52"
          class="stroke-domain-accent-ring/18 stroke-[0.4] fill-none animate-domain-ring-breathe [animation-delay:var(--delay)] [shape-rendering:crispEdges]"
          :style="{ '--delay': '3s' }"
        />
        <rect
          x="-36"
          y="-36"
          width="72"
          height="72"
          class="stroke-domain-accent-ring/18 stroke-[0.4] fill-none animate-domain-ring-breathe [animation-delay:var(--delay)] [shape-rendering:crispEdges]"
          :style="{ '--delay': '4.5s' }"
        />
        <rect
          x="-47"
          y="-47"
          width="94"
          height="94"
          class="stroke-domain-accent-ring/18 stroke-[0.4] fill-none animate-domain-ring-breathe [animation-delay:var(--delay)] [shape-rendering:crispEdges]"
          :style="{ '--delay': '6s' }"
        />

        <line
          x1="0"
          y1="-72"
          x2="0"
          y2="72"
          class="stroke-domain-ray/8 stroke-[0.15] animate-domain-ray-pulse [animation-delay:var(--rdelay)] [shape-rendering:crispEdges]"
          :style="{ '--rdelay': '0s' }"
        />
        <line
          x1="-72"
          y1="0"
          x2="72"
          y2="0"
          class="stroke-domain-ray/8 stroke-[0.15] animate-domain-ray-pulse [animation-delay:var(--rdelay)] [shape-rendering:crispEdges]"
          :style="{ '--rdelay': '1s' }"
        />

        <path
          d="M-6,-12 L-6,-6 L0,-6"
          class="stroke-domain-detail-bracket/60 stroke-[0.5] fill-none animate-domain-bracket-blink [animation-delay:var(--bdelay)] [shape-rendering:crispEdges]"
          :style="{ '--bdelay': '0s' }"
        />
        <path
          d="M6,-12  L6,-6  L0,-6"
          class="stroke-domain-detail-bracket/60 stroke-[0.5] fill-none animate-domain-bracket-blink [animation-delay:var(--bdelay)] [shape-rendering:crispEdges]"
          :style="{ '--bdelay': '0.5s' }"
        />
        <path
          d="M-6,12  L-6,6  L0,6"
          class="stroke-domain-detail-bracket/60 stroke-[0.5] fill-none animate-domain-bracket-blink [animation-delay:var(--bdelay)] [shape-rendering:crispEdges]"
          :style="{ '--bdelay': '1s' }"
        />
        <path
          d="M6,12   L6,6   L0,6"
          class="stroke-domain-detail-bracket/60 stroke-[0.5] fill-none animate-domain-bracket-blink [animation-delay:var(--bdelay)] [shape-rendering:crispEdges]"
          :style="{ '--bdelay': '1.5s' }"
        />
      </g>

      <text
        x="13"
        y="75"
        class="select-none fill-domain-text animate-domain-seal-flicker [filter:blur(0.3px)_drop-shadow(0_0_1px_theme(colors.domain.detail.shadow/80))]"
        font-size="11"
        text-anchor="middle"
        transform="rotate(-12, 22, 95)"
      >
        呪
      </text>

      <g class="animate-domain-corner-pulse">
        <rect
          x="2"
          y="2"
          width="6"
          height="1"
          class="fill-domain-corner-pink/40"
        />
        <rect
          x="2"
          y="2"
          width="1"
          height="6"
          class="fill-domain-corner-pink/40"
        />
        <rect
          x="3"
          y="4"
          width="2"
          height="1"
          class="fill-domain-corner-pink/20"
        />
      </g>
      <g class="animate-domain-corner-pulse">
        <rect
          x="92"
          y="2"
          width="6"
          height="1"
          class="fill-domain-corner-purple/40"
        />
        <rect
          x="97"
          y="2"
          width="1"
          height="6"
          class="fill-domain-corner-purple/40"
        />
        <rect
          x="95"
          y="4"
          width="2"
          height="1"
          class="fill-domain-corner-purple/20"
        />
      </g>
      <g class="animate-domain-corner-pulse">
        <rect
          x="2"
          y="97"
          width="6"
          height="1"
          class="fill-domain-corner-pink/40"
        />
        <rect
          x="2"
          y="92"
          width="1"
          height="6"
          class="fill-domain-corner-pink/40"
        />
      </g>
      <g class="animate-domain-corner-pulse">
        <rect
          x="92"
          y="97"
          width="6"
          height="1"
          class="fill-domain-corner-purple/40"
        />
        <rect
          x="97"
          y="92"
          width="1"
          height="6"
          class="fill-domain-corner-purple/40"
        />
      </g>

      <g>
        <rect
          x="20"
          y="30"
          width="0.8"
          height="0.8"
          class="fill-domain-particle/70 animate-domain-particle-float [animation-delay:0s] [animation-duration:8s] [shape-rendering:crispEdges]"
        />
        <rect
          x="75"
          y="20"
          width="0.8"
          height="0.8"
          class="fill-domain-particle/70 animate-domain-particle-float [animation-delay:2s] [animation-duration:11s] [shape-rendering:crispEdges]"
        />
        <rect
          x="60"
          y="70"
          width="1"
          height="1"
          class="fill-domain-particle/70 animate-domain-particle-float [animation-delay:4s] [animation-duration:9s] [shape-rendering:crispEdges]"
        />
        <rect
          x="35"
          y="80"
          width="0.6"
          height="0.6"
          class="fill-domain-particle/70 animate-domain-particle-float [animation-delay:1s] [animation-duration:13s] [shape-rendering:crispEdges]"
        />
        <rect
          x="85"
          y="55"
          width="0.8"
          height="0.8"
          class="fill-domain-particle/70 animate-domain-particle-float [animation-delay:6s] [animation-duration:10s] [shape-rendering:crispEdges]"
        />
        <rect
          x="10"
          y="60"
          width="1"
          height="1"
          class="fill-domain-particle/70 animate-domain-particle-float [animation-delay:3s] [animation-duration:12s] [shape-rendering:crispEdges]"
        />
        <rect
          x="50"
          y="15"
          width="0.6"
          height="0.6"
          class="fill-domain-particle/70 animate-domain-particle-float [animation-delay:5s] [animation-duration:7s] [shape-rendering:crispEdges]"
        />
        <rect
          x="90"
          y="85"
          width="0.8"
          height="0.8"
          class="fill-domain-particle/70 animate-domain-particle-float [animation-delay:7s] [animation-duration:14s] [shape-rendering:crispEdges]"
        />
      </g>

      <rect width="100" height="100" fill="url(#scanlines)" opacity="0.4" />
    </svg>

    <div
      class="absolute inset-0 pointer-events-none bg-gradient-to-b from-domain-slash-redStart to-domain-slash-red [clip-path:polygon(0_0,46%_0,30%_100%,0_100%)] opacity-22"
    />
    <div
      class="absolute inset-0 pointer-events-none bg-domain-slash-redGlow [clip-path:polygon(0_0,46%_0,30%_100%,0_100%)] opacity-7 [filter:blur(48px)] animate-domain-pulse-glow"
    />
    <div
      class="absolute inset-0 pointer-events-none bg-gradient-to-b from-domain-slashBlue-dark to-domain-slashBlue-DEFAULT [clip-path:polygon(60%_0,100%_0,100%_100%,44%_100%)] opacity-50"
    />
    <div
      class="absolute inset-0 pointer-events-none bg-domain-slashBlue-glow [clip-path:polygon(60%_0,100%_0,100%_100%,44%_100%)] opacity-5 [filter:blur(48px)] animate-domain-pulse-glow [animation-delay:7s]"
    />

    <div
      class="absolute inset-0 pointer-events-none bg-radial-[ellipse_at_50%_50%] from-domain-overlay-veil/12 to-transparent animate-domain-veil-pulse"
    />
    <div
      class="absolute top-[38%] left-[-10%] w-[120%] h-[2px] pointer-events-none [image-rendering:pixelated] bg-gradient-to-r from-transparent to-domain-slash-redStart/18 animate-domain-streak-slide [animation-delay:4s]"
    />
    <div
      class="absolute inset-0 pointer-events-none animate-domain-crt [box-shadow:inset_0_0_40px_theme(colors.domain.overlay.crt/4)]"
    />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
