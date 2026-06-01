import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: lockAcquired } = await supabase.rpc("try_matchmaking_lock"); // lock function
  if (!lockAcquired)
    return new Response("Instance already running.", { status: 200 });

  try {
    // Fetch all waiting players with fresh heartbeats
    const { data: queue } = await supabase
      .from("matchmaking_queue")
      .select("*, matchmaking_heartbeats!inner(last_heartbeat)")
      .eq("status", "waiting")
      .order("joined_at", { ascending: true });

    if (!queue || queue.length < 2)
      // must have at least 2 players to match
      return new Response("Not enough players.", { status: 200 });

    const matched = new Set<string>();

    // Find a match for every player in the queue
    for (let i = 0; i < queue.length; i++) {
      const player1 = queue[i];
      if (matched.has(player1.uid)) continue;

      const player2 = queue.find(
        (p) => p.uid !== player1.uid && !matched.has(p.uid),
      ); // find another player who is not already in the set
      if (!player2) continue;

      const { data: match } = await supabase
        .from("matches")
        .insert({
          player1_uid: player1.uid,
          player2_uid: player2.uid,
        })
        .select()
        .single();
      if (!match) continue;

      await supabase
        .from("matchmaking_queue")
        .update({ status: "matched", match_id: match.id }) // update status for queue row
        .in("uid", [player1.uid, player2.uid]); // for both players

      matched.add(player1.uid);
      matched.add(player2.uid);
    }

    return new Response("Matchmaking complete.", { status: 200 });
  } finally {
    await supabase.rpc("release_matchmaking_lock"); // unlock function
  }
});
