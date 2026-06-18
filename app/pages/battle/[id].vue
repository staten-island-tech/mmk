<template>
  <div class="select-none relative flex flex-col w-full h-screen">
    <UiModalSimple
      :open="dialogOpen"
      :title="dialogTitle"
      :close-button="false"
      :buttons="dialogButtons"
      @close="dialogOpen = false"
    >
      {{ dialogMessage }}
    </UiModalSimple>

    <Transition name="game" mode="out-in">
      <div
        v-if="!p1Card || !p2Card || !p1State || !p2State"
        key="loading"
        class="flex flex-col gap-4 justify-center items-center h-full text-blue-200"
      >
        <UiBackgroundDomain class="-z-10 brightness-75" />
        <Icon name="lucide:loader-circle" class="w-16 h-16 animate-spin" />
        <h2 class="text-3xl md:text-4xl tracking-wider">
          Loading battle<span class="dots" />
        </h2>
      </div>

      <div
        v-else-if="p1Card && p2Card && p1State && p2State"
        key="battle"
        class="relative w-full h-full flex flex-col"
      >
        <UiGameplayMovePopup
          :popups="battlePopups"
          class="pointer-events-none z-50 absolute inset-0"
        />

        <Transition name="win">
          <div
            v-if="battleState === 'finished'"
            class="z-40 absolute inset-0 flex flex-col justify-center items-center bg-black/80 backdrop-grayscale"
          >
            <div
              class="flex flex-col items-center gap-6 p-12 w-full border-y-8 border-double"
              :class="
                multiplayer.myPlayerNumber.value === winner
                  ? 'border-primary-border text-primary-foreground bg-primary-foreground/15'
                  : 'border-accent-border text-accent-foreground bg-accent-foreground/15'
              "
            >
              <p class="text-2xl tracking-wide uppercase">
                {{
                  multiplayer.myPlayerNumber.value === winner
                    ? "We have a victory!"
                    : "You've been defeated by..."
                }}
              </p>

              <h1 class="text-5xl tracking-widest font-display uppercase">
                {{ winner === 1 ? p1Username : p2Username }}
              </h1>

              <img
                :src="
                  winner === 1 ? p1Card.defaultSprite : p2Card.defaultSprite
                "
                class="h-32"
              />

              <p class="text-xl tracking-wide">
                {{ winner === 1 ? p1Username : p2Username }} {{ winMessage }}.
              </p>

              <div class="flex gap-5">
                <button
                  v-if="multiplayer.myPlayerNumber.value === winner"
                  class="mt-4 px-8 py-2 min-w-36 text-lg tracking-wider border-4 border-double border-primary-border transition-all duration-150 hover:text-white hover:bg-primary-hover active:scale-95"
                  @click="navigateTo(`/battle/win/${matchId}`)"
                >
                  Claim Reward
                </button>

                <template v-else>
                  <button
                    class="mt-4 px-8 py-2 min-w-36 text-lg tracking-wider border-4 border-double transition-all duration-150 hover:text-white active:scale-95"
                    :class="
                      multiplayer.myPlayerNumber.value === winner
                        ? 'border-primary-border hover:bg-primary-hover'
                        : 'border-accent-border hover:bg-accent-hover'
                    "
                    @click="navigateTo('/')"
                  >
                    Home
                  </button>

                  <button
                    class="mt-4 px-4 py-2 min-w-36 text-lg tracking-wider border-4 border-double transition-all duration-150 hover:text-white active:scale-95"
                    :class="
                      multiplayer.myPlayerNumber.value === winner
                        ? 'border-primary-border hover:bg-primary-hover'
                        : 'border-accent-border hover:bg-accent-hover'
                    "
                    @click="navigateTo('/queue')"
                  >
                    Requeue
                  </button>
                </template>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Domain effect -->
        <Transition name="game" mode="out-in">
          <component
            v-if="
              activeDomain && domainComponentMap[activeDomain.componentName]
            "
            :is="domainComponentMap[activeDomain.componentName]"
            ref="domainComponent"
            class="z-10 absolute inset-0 pointer-events-none"
          />
        </Transition>

        <!-- Battlefield -->
        <div
          class="z-20 overflow-hidden relative grid h-3/4 grid-cols-2 grid-rows-2 p-12"
          :class="{
            'bg-slate-100': !activeDomain,
            'h-full': battleState === 'finished',
          }"
          :style="{
            backgroundColor: activeDomain
              ? domainComponent?.THEME_BACKGROUND
              : undefined,
            backgroundImage: activeDomain
              ? `linear-gradient(${domainComponent?.THEME_BACKGROUND_GRID} 1px, transparent 1px), linear-gradient(90deg, ${domainComponent?.THEME_BACKGROUND_GRID} 1px, transparent 1px)`
              : 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            transition:
              'height 1s ease 1s, background-color 1s ease, background-image 1s ease',
          }"
        >
          <!-- Ground -->
          <div
            class="z-20 absolute bottom-0 left-1/2 w-[300%] h-96 origin-bottom transition-colors duration-1000"
            :class="{
              'bg-slate-200': !activeDomain,
            }"
            :style="{
              backgroundColor: activeDomain
                ? domainComponent?.THEME_GROUND
                : undefined,
              backgroundImage: activeDomain
                ? `linear-gradient(${domainComponent?.THEME_GROUND_GRID} 1px, transparent 1px), linear-gradient(90deg, ${domainComponent?.THEME_GROUND_GRID} 1px, transparent 1px)`
                : 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
              backgroundSize: '8rem 8rem',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, black 35%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, black 35%)',
              transform: 'translateX(-50%) perspective(350px) rotateX(45deg)',
            }"
          />

          <!-- Player 2 card -->
          <div class="flex items-start justify-start p-5 z-10">
            <UiGameplayCardDisplay
              :card="p2Card"
              :state="p2State"
              :is-active="currentPlayer === 2 && battleState === 'player_turn'"
              :playerLabel="p2Username"
              :accent="2"
            />
          </div>

          <!-- Player 1 card -->
          <div class="flex items-start justify-end p-5 z-10">
            <UiGameplayCardDisplay
              :card="p1Card"
              :state="p1State"
              :is-active="currentPlayer === 1 && battleState === 'player_turn'"
              :playerLabel="p1Username"
              :accent="1"
              :flip="true"
            />
          </div>

          <!-- Player 2 sprite -->
          <div
            class="z-30 flex items-end justify-start pl-32"
            :class="{
              'sprite-active':
                currentPlayer === 2 && battleState === 'player_turn',
            }"
          >
            <div class="relative flex flex-col-reverse items-center">
              <img
                :src="p2Card.defaultSprite"
                class="w-48 h-48 object-contain transition-all duration-300"
                :style="{
                  filter:
                    battle.healthTint(p2State.hp, p2State.maxHp) +
                    ' drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))',
                }"
              />
              <div class="absolute w-24 h-8 rounded-full bg-black/30 blur-md" />
            </div>
          </div>

          <!-- Player 1 sprite -->
          <div
            class="z-30 flex items-end justify-end pr-32"
            :class="{
              'sprite-active':
                currentPlayer === 1 && battleState === 'player_turn',
            }"
          >
            <div class="relative flex flex-col-reverse items-center">
              <img
                :src="p1Card.defaultSprite"
                class="w-48 h-48 object-contain scale-x-[-1] transition-all duration-300"
                :style="{
                  filter:
                    battle.healthTint(p1State.hp, p1State.maxHp) +
                    ' drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))',
                }"
              />
              <div class="absolute w-24 h-8 rounded-full bg-black/30 blur-md" />
            </div>
          </div>
        </div>

        <!-- Bottom panel -->
        <Transition name="panel">
          <UiCardSimple
            v-if="battleState !== 'finished'"
            class="z-20 relative p-8 w-full h-1/4 !max-w-full"
            :class="{
              'cursor-not-allowed brightness-75':
                battleState === 'player_turn' && multiplayer.isRemoteTurn.value,
            }"
          >
            <div
              v-if="battleState === 'dialogue' && currentDialogue"
              class="h-full min-h-0"
            >
              <UiGameplayDialogue
                :speaker="currentDialogue.speaker"
                :dialogue-text="currentDialogue.text"
                :typing-speed-cps="50"
                :can-continue="
                  currentPlayer === multiplayer.myPlayerNumber.value
                "
                @finished="onDialogueFinished"
              />
            </div>

            <div
              v-else-if="battleState === 'effects' && effectsMessage"
              class="h-full min-h-0"
            >
              <UiGameplayDialogue
                speaker="Battle Log"
                :dialogue-text="effectsMessage"
                :typing-speed-cps="60"
                :can-continue="
                  currentPlayer === multiplayer.myPlayerNumber.value
                "
                @finished="onEffectsFinished"
              />
            </div>

            <div v-else-if="battleState === 'prevented'" class="h-full min-h-0">
              <UiGameplayDialogue
                :speaker="
                  currentPlayer === 1
                    ? `${p1Username} (${p1Card.name})`
                    : `${p2Username} (${p2Card.name})`
                "
                :dialogue-text="preventedMessage"
                :typing-speed-cps="70"
                :can-continue="
                  currentPlayer !== multiplayer.myPlayerNumber.value
                "
                @finished="onPreventedFinished"
              />
            </div>

            <!-- Move selection -->
            <div
              v-else-if="battleState === 'player_turn'"
              class="flex items-center gap-16 h-full"
            >
              <div>
                <p class="text-md tracking-widest font-alt uppercase">
                  What will
                </p>
                <p
                  class="text-xl leading-tight"
                  :class="
                    currentPlayer === 1
                      ? 'text-game-p1-accent'
                      : 'text-game-p2-accent'
                  "
                >
                  {{ currentPlayer === 1 ? p1Username : p2Username }}
                </p>
                <p class="text-md tracking-widest font-alt uppercase">do?</p>
              </div>

              <!-- Move list -->
              <div
                class="overflow-y-auto flex-1 flex items-start pr-2 w-full h-full"
              >
                <div class="grid grid-cols-3 auto-rows-fr gap-4 w-full">
                  <UiGameplayMoveButton
                    v-for="move in currentMoves"
                    :key="move.id"
                    :move="move"
                    :cooldownRemaining="
                      currentPlayerState.moveCooldowns[move.move.id] ?? 0
                    "
                    :currentEnergy="currentPlayerState.moveEnergy"
                    @select="selectMove"
                    class="w-full h-full"
                    :class="{
                      'pointer-events-none':
                        battleState === 'player_turn' &&
                        multiplayer.isRemoteTurn.value,
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- Idle -->
            <div v-else class="flex flex-col gap-5 w-full h-full min-h-0">
              <div class="flex flex-col gap-2 h-full min-h-0">
                <p
                  class="text-sm text-slate-500 tracking-widest font-semibold uppercase"
                >
                  Awaiting Response
                </p>

                <div
                  class="overflow-y-auto w-full h-full min-h-0 whitespace-pre-line"
                >
                  Waiting for a signal to continue<span class="dots" />
                </div>
              </div>
            </div>
          </UiCardSimple>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { type PopupType } from "~/composables/useBattlePopup";

const config = useRuntimeConfig();
const user = useUserStore();

const route = useRoute();
const matchId = route.params.id as string;

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

function showMatchError(message: string) {
  if (dialogOpen.value) return;

  dialogTitle.value = "Error Connecting to Match";
  dialogMessage.value = message;
  dialogButtons.value = [
    {
      label: "Leave Match",
      priority: 1,
      callback: async () => {
        handleUnload();
        multiplayer.cleanup();
        await navigateTo("/");
      },
    },
  ];
  dialogOpen.value = true;
}

const p1Username = ref<string>("Player 1");
const p2Username = ref<string>("Player 2");

const battleState = ref<BattleState>("player_turn");
const p1Card = ref<Card | null>(null);
const p2Card = ref<Card | null>(null);
const p1State = ref<PlayerState | null>(null);
const p2State = ref<PlayerState | null>(null);
const currentPlayer = ref<1 | 2>(1);
const winner = ref<1 | 2 | null>(null);
const activeDomain = ref<ActiveDomain | null>(null);
const domainJustActivated = ref<boolean>(false);
const effectsMessage = ref<string>("");

const dialogueQueue = ref<DialogueLine[]>([]);
const currentDialogue = ref<DialogueLine | null>(null);
let afterDialogueCallback: (() => void) | null = null;
const preventedMessage = ref<string>("");

const winMessage = computed<string>(() => {
  const messages = [
    "was a tad bit stronger",
    "had the sharper sword",
    "absolutely dominated this one",
    "was clearly locked-in",
    "forgot what it means to lose",
  ];
  return messages[Math.floor(Math.random() * messages.length)]!;
});

const audioRef = ref<HTMLAudioElement | null>(null);
const domainComponent = ref<any>(null);
const domainComponentMap: Record<string, any> = {
  DomainsMalice: resolveComponent("DomainsMalice"),
  DomainsWormhole: resolveComponent("DomainsWormhole"),
  DomainsStargate: resolveComponent("DomainsStargate"),
  DomainsSingularity: resolveComponent("DomainsSingularity"),
  DomainsEntropy: resolveComponent("DomainsEntropy"),
};

const currentMoves = computed<readonly CardMove[]>(() => {
  if (!p1Card.value || !p2Card.value) return [];
  return currentPlayer.value === 1 ? p1Card.value.moves : p2Card.value.moves;
});

const currentPlayerState = computed<PlayerState>(() => {
  return currentPlayer.value === 1 ? p1State.value! : p2State.value!;
});

const lastMove = ref<SyncedGameState["lastMove"]>(null);

let finalized = false;

const { popups: battlePopups, show: showPopup } = useBattlePopup();

const battle = useBattleEngine(
  p1State,
  p2State,
  p1Card,
  p2Card,
  p1Username,
  p2Username,
  currentPlayer,
  battleState,
  winner,
  activeDomain,
  domainJustActivated,
  effectsMessage,
);

const multiplayer = useMultiplayerBattle(matchId, battle, {
  p1State,
  p2State,
  p1Card,
  p2Card,
  currentPlayer,
  battleState,
  winner,
  activeDomain,
  domainJustActivated,
  effectsMessage,
  currentDialogue,
  preventedMessage,
  lastMove,
  onRemoteMove: (
    name: string,
    damage: number | null,
    player: 1 | 2,
    username: string,
    type: string,
  ) => {
    showPopup(name, damage, player as 1 | 2, username, type as PopupType);
  },
});

function getMoveType(move: CardMove["move"]): PopupType {
  if (move.domain) return "domain";
  if (move.selfPoison || move.enemyPoison) return "poison";
  if (move.damage) return "attack";
  if (move.selfDefenseMultiplier || move.selfDefenseScalarBoost)
    return "defense";
  return "default";
}

function selectMove(cardMove: CardMove) {
  if (battleState.value !== "player_turn") return;
  if (currentPlayer.value !== multiplayer.myPlayerNumber.value) return;

  const move = cardMove.move;
  const selfCard = currentPlayer.value === 1 ? p1Card.value! : p2Card.value!;
  const enemyCard = currentPlayer.value === 1 ? p2Card.value! : p1Card.value!;

  let actualDamage: number | null = null;
  if (move.damage && p1State.value && p2State.value) {
    const attacker = currentPlayer.value === 1 ? p1State.value : p2State.value;
    const defender = currentPlayer.value === 1 ? p2State.value : p1State.value;
    actualDamage = battle.calcDamage(attacker, move, defender);
  }

  dialogueQueue.value = [];
  if (move.selfCustomDialogue)
    enqueueDialogue(
      `${currentPlayer.value === 1 ? p1Username.value : p2Username.value} (${selfCard.name})`,
      move.selfCustomDialogue,
    );
  if (move.enemyCustomDialogue)
    enqueueDialogue(
      `${currentPlayer.value === 1 ? p2Username.value : p1Username.value} (${enemyCard.name})`,
      move.enemyCustomDialogue,
    );

  const username =
    currentPlayer.value === 1 ? p1Username.value : p2Username.value;

  // Show a popup for the move
  showPopup(
    move.name,
    actualDamage,
    currentPlayer.value,
    username,
    getMoveType(move),
  );

  lastMove.value = {
    name: move.name,
    damage: actualDamage,
    player: currentPlayer.value,
    username,
    type: getMoveType(move),
  };

  const runMoveExecution = () => {
    multiplayer.submitMove(move);
  };

  if (dialogueQueue.value.length > 0) startDialogueQueue(runMoveExecution);
  else runMoveExecution();
}

function enqueueDialogue(speaker: string, rawText: string) {
  const parts = rawText.split(/\$\$BREAK\$\$/i);
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed) dialogueQueue.value.push({ speaker, text: trimmed });
  }
}

function startDialogueQueue(onDone: () => void) {
  afterDialogueCallback = onDone;
  if (dialogueQueue.value.length === 0) return onDone();
  battleState.value = "dialogue";
  currentDialogue.value = dialogueQueue.value[0]!;
}

function advanceDialogue() {
  dialogueQueue.value.shift();
  if (dialogueQueue.value.length > 0)
    currentDialogue.value = dialogueQueue.value[0]!;
  else {
    currentDialogue.value = null;
    const cb = afterDialogueCallback;
    afterDialogueCallback = null;
    cb?.();
  }
}

function onDialogueFinished() {
  // only the player who started it can advance it
  if (currentPlayer.value !== multiplayer.myPlayerNumber.value) return;

  if (dialogueQueue.value.length > 0 || afterDialogueCallback)
    advanceDialogue();
}

function onEffectsFinished() {
  if (currentPlayer.value !== multiplayer.myPlayerNumber.value) return;
  battle.onEffectsFinished();
}

function onPreventedFinished() {
  if (currentPlayer.value === multiplayer.myPlayerNumber.value) return;
  if (!p1State.value || !p2State.value) return;

  const stateRef = currentPlayer.value === 1 ? p1State : p2State;
  stateRef.value!.preventedTurns = Math.max(
    0,
    stateRef.value!.preventedTurns - 1,
  );

  battle.switchTurn();
}

watch(battleState, (val) => {
  if (val === "prevented" && p1Card.value && p2Card.value) {
    const name =
      currentPlayer.value === 1
        ? `${p1Username.value} (${p1Card.value.name})`
        : `${p2Username.value} (${p2Card.value.name})`;
    preventedMessage.value = `${name} is unable to move this turn.`;
  }
});

function resolveAudioSrc(): string | null {
  if (!p1Card.value || !p2Card.value) return null;

  const p1Audio = p1Card.value.audio;
  const p2Audio = p2Card.value.audio;

  if (p1Audio && p2Audio)
    return p1Card.value.rarity.weight >= p2Card.value.rarity.weight
      ? p1Audio
      : p2Audio;

  return p1Audio || p2Audio || null;
}

function handleUnload() {
  if (!user.data?.sub || !matchId) return;

  navigator.sendBeacon(
    "/api/battle/leave",
    new Blob(
      [
        JSON.stringify({
          uid: user.data?.sub,
          matchId: matchId,
        }),
      ],
      { type: "application/json" },
    ),
  );
}

watch(
  () => battleState.value,
  async (state) => {
    if (state !== "finished") return;
    if (finalized) return;
    finalized = true;

    await $fetch("/api/battle/finalize", {
      method: "POST",
      body: { matchId },
    });

    await user.fetchStats(true);
  },
);

watch(
  () => multiplayer.hasSyncError.value,
  (hasError) => {
    if (hasError) {
      showMatchError(
        "Failed to connect to the match. If you're using an ad blocker or privacy tool, try disabling it; MMK's servers may be flagged as suspicious. MMK does not serve ads or track users.",
      );
    }
  },
);

onMounted(async () => {
  try {
    if (!user.data)
      await new Promise<void>((resolve) => {
        const stop = watch(user, (val) => {
          if (val) {
            stop();
            resolve();
          }
        });
      });

    const userId = user.data?.sub;
    if (!userId) throw new Error("You must be logged in to play.");

    const { data: matchData, error } = await user.supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (error || !matchData) throw new Error("Match not found.");
    multiplayer.match.value = matchData;

    if (matchData.player1_uid === userId) multiplayer.myPlayerNumber.value = 1;
    else if (matchData.player2_uid === userId)
      multiplayer.myPlayerNumber.value = 2;
    else throw new Error("You are not part of this match.");

    const { data: users } = await user.supabase.rpc("get_user_display_names", {
      user_ids: [matchData.player1_uid, matchData.player2_uid],
    });

    if (users) {
      const p1User = users.find((u) => u.id === matchData.player1_uid);
      const p2User = users.find((u) => u.id === matchData.player2_uid);

      if (p1User?.display_name) p1Username.value = p1User.display_name;
      if (p2User?.display_name) p2Username.value = p2User.display_name;
    }

    if (!matchData.player1_card_id || !matchData.player2_card_id)
      throw new Error("Card IDs missing from match.");

    const [p1Data, p2Data] = await Promise.all([
      $fetch<Card[]>(`${config.public.mmkPanelApi}/cards`, {
        query: { id: matchData.player1_card_id },
      }),
      $fetch<Card[]>(`${config.public.mmkPanelApi}/cards`, {
        query: { id: matchData.player2_card_id },
      }),
    ]);

    p1Card.value = p1Data[0] || null;
    p2Card.value = p2Data[0] || null;
    if (!p1Card.value || !p2Card.value) throw new Error("Cards not found.");

    try {
      await multiplayer.subscribe();
    } catch (e) {
      console.error(
        "Failed to subscribe to realtime. Relying on polling instead.",
      );
    }

    /* If Player 1 disconnects, Player 2 wins, and Player 1 refreshes, the page won't realize the match was abandoned.
     * The first check here just makes sure the match was actually abandoned.
     */
    if (matchData.status === "abandoned") {
      battleState.value = "finished";
      winner.value =
        matchData.winner === userId
          ? multiplayer.myPlayerNumber.value
          : multiplayer.myPlayerNumber.value === 1
            ? 2
            : 1;
    } else if (
      matchData.game_state &&
      (matchData.game_state as any).initialized
    ) {
      const gs = matchData.game_state as any;
      multiplayer.applyInitialState(gs);
    } else if (multiplayer.myPlayerNumber.value === 1)
      await multiplayer.initializeGame(p1Card.value, p2Card.value);

    if (
      multiplayer.myPlayerNumber.value === 2 &&
      (!matchData.game_state || !(matchData.game_state as any).initialized)
    ) {
      const pollInterval = setInterval(async () => {
        const { data: updatedMatch } = await user.supabase
          .from("matches")
          .select("game_state")
          .eq("id", matchId)
          .single();

        if (
          updatedMatch?.game_state &&
          (updatedMatch.game_state as any).initialized
        ) {
          clearInterval(pollInterval);
          const gs = updatedMatch.game_state as any;
          multiplayer.applyInitialState(gs);
        }
      }, 1000);

      setTimeout(() => clearInterval(pollInterval), 30000); // stop polling after 30 seconds
    }

    multiplayer.startHeartbeats();

    const src = resolveAudioSrc();
    if (src) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0.5;
      audio.play().catch(() => {
        const resume = () => {
          audio.play();
          window.removeEventListener("pointerdown", resume);
        };
        window.addEventListener("pointerdown", resume);
      });
      audioRef.value = audio;
    }

    window.addEventListener("beforeunload", handleUnload);
  } catch (e) {
    console.error(e);
  }
});

onBeforeUnmount(() => {
  audioRef.value?.pause();
  audioRef.value = null;

  multiplayer.cleanup();

  window.removeEventListener("beforeunload", handleUnload);
});
</script>

<style>
.game-enter-active,
.game-leave-active {
  transition: opacity 1s ease;
}

.game-enter-from,
.game-leave-to {
  opacity: 0;
}

.panel-enter-active,
.panel-leave-active {
  transition: transform 1s ease 1s;
}

.panel-enter-from,
.panel-leave-to {
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translateY(100%);
}

.win-enter-active,
.win-leave-active {
  transition: opacity 0.5s ease 3s;
}

.win-enter-from,
.win-leave-to {
  opacity: 0;
}

.dots::after {
  content: "";
  animation: dots 2s infinite;
}

@keyframes dots {
  0% {
    content: "";
  }

  25% {
    content: ".";
  }

  50% {
    content: "..";
  }

  75% {
    content: "...";
  }

  100% {
    content: "";
  }
}
</style>
