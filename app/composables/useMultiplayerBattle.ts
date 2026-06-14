import type { Database } from "~/types/database.types";

export function useMultiplayerBattle(
  matchId: string,
  battle: ReturnType<typeof useBattleEngine>,
  engineRefs: any,
) {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const match = ref<any>(null);
  const myPlayerNumber = ref<1 | 2 | null>(null);

  let isInitialLoad = true;
  let isRemoteUpdate = false;

  let pingInterval: ReturnType<typeof setInterval> | null = null;
  let watchInterval: ReturnType<typeof setInterval> | null = null;

  const isRemoteTurn = computed(() => {
    if (myPlayerNumber.value === null) return true;
    return engineRefs.currentPlayer.value !== myPlayerNumber.value;
  });

  const onRemoteMove:
    | ((
        name: string,
        damage: number | null,
        player: 1 | 2,
        username: string,
        type: string,
      ) => void)
    | undefined = engineRefs.onRemoteMove;

  let channel: any = null;

  /** Post changes to the row. */
  async function syncDatabase() {
    if (
      !match.value ||
      !myPlayerNumber.value ||
      (engineRefs.battleState.value === "dialogue" &&
        !engineRefs.currentDialogue.value) ||
      (engineRefs.battleState.value === "prevented" &&
        !engineRefs.preventedMessage.value)
    )
      return;

    const newState: SyncedGameState = {
      p1State: engineRefs.p1State.value,
      p2State: engineRefs.p2State.value,
      currentPlayer: engineRefs.currentPlayer.value,
      activeDomain: engineRefs.activeDomain.value,
      battleState: engineRefs.battleState.value,
      winner: engineRefs.winner.value,
      initialized: true,
      currentDialogue: engineRefs.currentDialogue.value,
      effectsMessage: engineRefs.effectsMessage.value,
      preventedMessage: engineRefs.preventedMessage.value,
      lastMove: engineRefs.lastMove?.value ?? null,
    };

    if (engineRefs.lastMove) engineRefs.lastMove.value = null; // stop subsequent syncs from triggering the popup

    const shouldUpdateTurn =
      newState.battleState === "player_turn" ||
      newState.battleState === "finished";

    const nextTurnUid = shouldUpdateTurn
      ? newState.currentPlayer === 1
        ? match.value.player1_uid
        : match.value.player2_uid
      : match.value.current_turn;

    match.value.current_turn = nextTurnUid;

    const updatePayload: any = {
      game_state: newState,
      current_turn: nextTurnUid,
    };

    // If someone already won, we should add it to the payload so that the database does not mark it as abandoned after the 30-second timeout.
    if (newState.battleState === "finished" && newState.winner) {
      updatePayload.status = "finished";
      updatePayload.winner =
        newState.winner === 1
          ? match.value.player1_uid
          : match.value.player2_uid;
    }

    await supabase.from("matches").update(updatePayload).eq("id", matchId);
  }

  let syncQueue = Promise.resolve();

  const gameStateDigest = computed(() =>
    JSON.stringify({
      battleState: engineRefs.battleState.value,
      currentPlayer: engineRefs.currentPlayer.value,
      currentDialogue: engineRefs.currentDialogue.value,
      effectsMessage: engineRefs.effectsMessage.value,
      preventedMessage: engineRefs.preventedMessage.value,
      winner: engineRefs.winner.value,
      p1Hp: engineRefs.p1State.value?.hp,
      p2Hp: engineRefs.p2State.value?.hp,
      p1Energy: engineRefs.p1State.value?.moveEnergy,
      p2Energy: engineRefs.p2State.value?.moveEnergy,
    }),
  );

  watch(
    gameStateDigest,
    () => {
      if (isInitialLoad || isRemoteUpdate) return;
      syncQueue = syncQueue.then(() => nextTick()).then(() => syncDatabase());
    },
    { immediate: false },
  );

  /** Send a heartbeat. */
  async function pingHeartbeat() {
    if (!user.value?.sub || engineRefs.battleState.value === "finished") return;

    await supabase
      .from("battle_heartbeats")
      .upsert(
        { uid: user.value.sub, last_heartbeat: new Date().toISOString() },
        { onConflict: "uid" },
      );
  }

  async function checkOpponentHeartbeat() {
    if (!match.value || engineRefs.battleState.value === "finished") return;

    const opponentUid =
      myPlayerNumber.value === 1
        ? match.value.player2_uid
        : match.value.player1_uid;

    const { data } = await supabase
      .from("battle_heartbeats")
      .select("last_heartbeat")
      .eq("uid", opponentUid)
      .single();

    if (data?.last_heartbeat) {
      const lastPing = new Date(data.last_heartbeat).getTime();
      const now = Date.now();

      if (now - lastPing > 30000) {
        // assume they disconnected
        console.warn("Opponent disconnected. Claiming victory.");

        if (watchInterval) clearInterval(watchInterval);

        await supabase
          .from("matches")
          .update({
            status: "abandoned",
            winner: user.value!.sub,
          })
          .eq("id", matchId);

        engineRefs.battleState.value = "finished";
        engineRefs.winner.value = myPlayerNumber.value;
      }
    }
  }

  function startHeartbeats() {
    pingInterval = setInterval(pingHeartbeat, 5000);
    pingHeartbeat();
    watchInterval = setInterval(checkOpponentHeartbeat, 5000); // check opponent
  }

  function stopHeartbeats() {
    if (pingInterval) clearInterval(pingInterval);
    if (watchInterval) clearInterval(watchInterval);
    if (user.value?.sub)
      supabase.from("battle_heartbeats").delete().eq("uid", user.value.sub);
  }

  /** Subscribe to the Supabase channel and listen for changes to the row. */
  function subscribe() {
    if (channel) supabase.removeChannel(channel);

    channel = supabase.channel(`match:${matchId}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload: any) => {
          const newState = payload.new.game_state as SyncedGameState;
          match.value = payload.new;

          if (payload.new.status === "abandoned") {
            engineRefs.battleState.value = "finished";

            if (payload.new.winner === user.value?.sub)
              engineRefs.winner.value = myPlayerNumber.value; // current player won
            else engineRefs.winner.value = myPlayerNumber.value === 1 ? 2 : 1; // current player lost

            return;
          }

          if (newState && newState.initialized) {
            isRemoteUpdate = true;

            engineRefs.p1State.value = newState.p1State;
            engineRefs.p2State.value = newState.p2State;
            engineRefs.currentPlayer.value = newState.currentPlayer;
            engineRefs.activeDomain.value = newState.activeDomain;
            engineRefs.battleState.value = newState.battleState;
            engineRefs.winner.value = newState.winner;

            engineRefs.currentDialogue.value = newState.currentDialogue;
            engineRefs.effectsMessage.value = newState.effectsMessage;
            engineRefs.preventedMessage.value = newState.preventedMessage;

            isInitialLoad = false;

            if (
              newState?.lastMove &&
              onRemoteMove &&
              newState.lastMove.player !== myPlayerNumber.value
            )
              onRemoteMove(
                newState.lastMove.name,
                newState.lastMove.damage,
                newState.lastMove.player,
                newState.lastMove.username,
                newState.lastMove.type,
              );

            nextTick().then(() => {
              isRemoteUpdate = false;
            });
          }
        },
      )
      .subscribe();
  }

  /** Apply state fetched on initial page load. */
  function applyInitialState(gs: SyncedGameState) {
    engineRefs.p1State.value = gs.p1State;
    engineRefs.p2State.value = gs.p2State;
    engineRefs.currentPlayer.value = gs.currentPlayer;
    engineRefs.activeDomain.value = gs.activeDomain;
    engineRefs.battleState.value = gs.battleState;
    engineRefs.winner.value = gs.winner;
    engineRefs.currentDialogue.value = gs.currentDialogue;
    engineRefs.effectsMessage.value = gs.effectsMessage;
    engineRefs.preventedMessage.value = gs.preventedMessage;
  }

  /** Start the game and set initial state. Should only be activated by the first player. */
  async function initializeGame(p1Card: Card, p2Card: Card) {
    if (myPlayerNumber.value !== 1) return;

    isRemoteUpdate = true;

    const p1State = battle.createPlayerState(p1Card);
    const p2State = battle.createPlayerState(p2Card);

    engineRefs.p1State.value = p1State;
    engineRefs.p2State.value = p2State;

    battle.initializeBattle();

    const initialState: SyncedGameState = {
      p1State: engineRefs.p1State.value,
      p2State: engineRefs.p2State.value,
      currentPlayer: engineRefs.currentPlayer.value,
      activeDomain: engineRefs.activeDomain.value,
      battleState: engineRefs.battleState.value,
      winner: engineRefs.winner.value,
      initialized: true,
      currentDialogue: engineRefs.currentDialogue.value,
      effectsMessage: engineRefs.effectsMessage.value,
      preventedMessage: engineRefs.preventedMessage.value,
    };

    const nextTurnUid =
      initialState.currentPlayer === 1
        ? match.value.player1_uid
        : match.value.player2_uid;

    await supabase
      .from("matches")
      .update({
        game_state: initialState as any,
        current_turn: nextTurnUid,
        status: "in_progress",
      })
      .eq("id", matchId);

    isInitialLoad = false;

    nextTick().then(() => {
      isRemoteUpdate = false;
    });
  }

  /** Submit a move for the turn. */
  function submitMove(move: CardMove["move"]) {
    if (
      engineRefs.currentPlayer.value !== myPlayerNumber.value ||
      (engineRefs.battleState.value !== "player_turn" &&
        engineRefs.battleState.value !== "dialogue")
    )
      return;

    battle.executeMove(move);
  }

  /** Exit and remove the channel. */
  function cleanup() {
    if (channel) supabase.removeChannel(channel);
    stopHeartbeats();
  }

  return {
    match,
    myPlayerNumber,
    isRemoteTurn,
    subscribe,
    applyInitialState,
    initializeGame,
    submitMove,
    cleanup,
    startHeartbeats,
  };
}
