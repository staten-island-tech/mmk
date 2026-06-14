<template>
  <div class="flex justify-center items-center p-4 w-screen h-screen">
    <UiBackgroundDomain class="-z-10 brightness-75" />

    <div>
      <UiModalSimple
        :open="dialogOpen"
        :title="dialogTitle"
        :close-button="false"
        :buttons="dialogButtons"
        @close="dialogOpen = false"
      >
        {{ dialogMessage }}
      </UiModalSimple>

      <div
        class="z-10 flex flex-col justify-center items-center text-center gap-6"
      >
        <Icon
          name="pixelarticons:search"
          class="hover w-36 h-36 md:w-40 md:h-40 text-blue-400"
        />
        <h1 class="text-4xl md:text-5xl font-bold">
          <span class="px-2 text-red-300 rounded-l-lg bg-red-800">Match</span
          ><span class="px-2 text-blue-300 rounded-r-lg bg-blue-800"
            >making</span
          >
        </h1>
        <h2 class="text-xl md:text-2xl tracking-wider text-blue-200">
          Searching for a worthy opponent<span class="dots"></span>
        </h2>
        <UiButtonSimpleAccent
          label="Cancel"
          class="w-36"
          @click="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "authenticated",
});

const user = useUserStore();

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

function showQueueError(message: string) {
  if (dialogOpen.value) return;

  dialogTitle.value = "Matchmaking Error";
  dialogMessage.value = message;
  dialogButtons.value = [
    {
      label: "Leave Queue",
      priority: 1,
      callback: () => handleCancel(),
    },
  ];
  dialogOpen.value = true;
}

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let channel: ReturnType<typeof user.supabase.channel> | null = null;

async function heartbeat() {
  if (!user.data?.sub) return;

  if (!channel) {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    return;
  }

  await user.supabase.from("matchmaking_heartbeats").upsert(
    {
      uid: user.data.sub,
      last_heartbeat: new Date().toISOString(),
    },
    { onConflict: "uid" },
  );
}

async function joinQueue() {
  channel = user.supabase.channel("queue-entry"); // realtime connection

  /* Watch for updates to the user's row in the "matchmaking_queue" table.
   * When it gets updated, check if the new row status says "matched."
   * If so, leave the queue without deleting the row and navigate to the game.
   * This is all done before adding the user to the queue to avoid getting matched before listening.
   */
  // Wait for the subscription to be fully established before joining
  await new Promise<void>((resolve, reject) => {
    channel!
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matchmaking_queue",
          filter: `uid=eq.${user.data?.sub}`,
        },
        (payload: any) => {
          if (payload.new.status === "matched") {
            leaveQueue(false);
            navigateTo(`/battle/${payload.new.match_id}`);
          }
        },
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") resolve();
        else if (status === "CHANNEL_ERROR") {
          reject(new Error("Channel error"));
          showQueueError(
            "Failed to connect to matchmaking. If you're using an ad blocker or privacy tool, try disabling it; MMK's servers may be flagged as suspicious. MMK does not serve ads or track users.",
          );
        }
      });
  });

  // Send heartbeat
  const { error: heartbeatError } = await user.supabase
    .from("matchmaking_heartbeats")
    .upsert(
      { uid: user.data?.sub, last_heartbeat: new Date().toISOString() },
      { onConflict: "uid" },
    );
  if (heartbeatError)
    return showQueueError(
      "Failed to ping queuing server. If you're using an ad blocker or privacy tool, try disabling it; MMK's servers may be flagged as suspicious. MMK does not serve ads or track users.",
    );

  // Add the user to the queue
  const { error: queueError } = await user.supabase
    .from("matchmaking_queue")
    .insert({ uid: user.data?.sub, rank: user.rank ?? "Grade IV" });
  if (queueError)
    return showQueueError(
      "Failed to join queue. If you're using an ad blocker or privacy tool, try disabling it; MMK's servers may be flagged as suspicious. MMK does not serve ads or track users.",
    );

  // Every 5 seconds, ping the "matchmaking_heartbeats" table to confirm that the user is still in the queue
  heartbeatInterval = setInterval(heartbeat, 5000);

  window.addEventListener("beforeunload", handleUnload); // when tab is closed (etc.)
}

async function leaveQueue(deleteRow = true) {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  if (channel) {
    channel.unsubscribe();
    channel = null;
  }

  window.removeEventListener("beforeunload", handleUnload);

  if (deleteRow && user.data?.sub) {
    await user.supabase
      .from("matchmaking_heartbeats")
      .delete()
      .eq("uid", user.data?.sub);
  }
}

function handleUnload() {
  // Beacons get completed even if the page dies
  navigator.sendBeacon(
    "/api/queue/leave",
    new Blob(
      [
        JSON.stringify({
          uid: user.data?.sub,
        }),
      ],
      { type: "application/json" },
    ),
  );
}

async function handleCancel() {
  await leaveQueue();
  navigateTo("/");
}

onMounted(() => {
  joinQueue();
});

onUnmounted(() => {
  leaveQueue();
});
</script>

<style scoped>
.hover {
  animation: float 2s cubic-bezier(0.15, 0.8, 0.5, 1) infinite;
}

.dots::after {
  content: "";
  animation: dots 2s infinite;
}

@keyframes float {
  0% {
    @apply text-blue-300;
    transform: translateX(15px) translateY(0);
  }

  33% {
    @apply text-red-300;
    transform: translateX(0) translateY(-30px);
  }

  67% {
    @apply text-purple-300;
    transform: translateX(-15px) translateY(0);
  }

  100% {
    @apply text-blue-300;
    transform: translateX(15px) translateY(0);
  }
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
