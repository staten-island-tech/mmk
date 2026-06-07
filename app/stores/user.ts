import type { Database } from "~/types/database.types";
import type { Card } from "~/types/collection";
import type { CombinedCard } from "~/types/user";

export const useUserStore = defineStore("user", () => {
  const config = useRuntimeConfig();
  const supabase = useSupabaseClient<Database>();
  const data = useSupabaseUser();

  /** The number of wins the user has. (int32) */
  const wins = ref<number | null>(null);
  /** The number of games the user has played. (int32) */
  const games = ref<number | null>(null);
  /** The array of card IDs the user owns. (int32[]) */
  const cards = ref<CombinedCard[] | null>(null);

  const STORAGE_KEY = "user-stats-cache";
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  if (import.meta.client) {
    // load user cache on store init
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed: {
          wins: number;
          games: number;
          cards: CombinedCard[];
          timestamp: number;
        } = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          wins.value = parsed.wins;
          games.value = parsed.games;
          cards.value = parsed.cards;
        } else localStorage.removeItem(STORAGE_KEY); // expired cache
      }
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * The user's rank.
   * Determined by the highest ranking card in the user's collection.
   */
  const rank = computed<string | null>(() =>
    /* Find the rarity with the highest desperation constant.
     * The `userCards.value.reduce()` call compares `a` (the accumulator, a.k.a. the last visited card with the highest desperation constant) and `b` (the current card).
     *   - If the desperation constant of `a` is still greater than that of `b` (i.e., `b` is not a possible candidate for the user's rank), return `a` as the same accumulator.
     *   - Otherwise, if the desperation constant of `a` is less than or equal to that of `b`, return `b` as the new accumulator (i.e., the currently known card with the highest desperation constant).
     */
    !cards.value
      ? null
      : cards.value.length
        ? cards.value.reduce((a, b) =>
            a.rarity.weight > b.rarity.weight ? a : b,
          ).rarity.name
        : "Grade I",
  );

  /** Retrieve user stats. */
  async function fetchStats(forceRefresh = false) {
    if (!forceRefresh && cards.value !== null) return;

    const { data: stats } = await $fetch("/api/stats");
    wins.value = stats.wins;
    games.value = stats.games;

    const cardsMap = new Map(
      stats.cards.map((c) => [c.card_id, c.obtained_at]),
    );

    // Get all cards from card IDs
    const cardsData = await $fetch<Card[]>(
      `${config.public.mmkPanelApi}/cards`,
      {
        query: { id: stats.cards.map((card) => card.card_id).join(",") },
      },
    );

    cards.value = cardsData.map((card) => ({
      ...card,
      obtained_at: cardsMap.get(card.id),
    })); // add card obtain timestamp

    saveToCache();
  }

  /** Clear cache and force refresh. */
  function invalidateCache() {
    localStorage.removeItem(STORAGE_KEY);
    cards.value = null;
    wins.value = null;
    games.value = null;
  }

  /** Save current state to cache, */
  function saveToCache() {
    if (import.meta.client && cards.value !== null)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          cards: cards.value,
          wins: wins.value,
          games: games.value,
          timestamp: Date.now(),
        }),
      );
  }

  return {
    supabase,
    data,
    cards,
    wins,
    games,
    rank,
    fetchStats,
    invalidateCache,
  };
});
