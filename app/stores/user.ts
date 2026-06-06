import type { Database } from "~/types/database.types";
import type { Card } from "~/types/collection";

export const useUserStore = defineStore("user", () => {
  const config = useRuntimeConfig();
  const supabase = useSupabaseClient<Database>();
  const data = useSupabaseUser();

  /** The number of wins the user has. (int32) */
  const wins = ref<number | null>(null);
  /** The number of games the user has played. (int32) */
  const games = ref<number | null>(null);
  /** The array of card IDs the user owns. (int32[]) */
  const cards = ref<Card[] | null>(null);

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

  async function fetchStats() {
    const { data: stats } = await $fetch("/api/stats");
    wins.value = stats.wins;
    games.value = stats.games;

    // Get all cards from card IDs
    const cardsData = await $fetch<Card[]>(
      `${config.public.mmkPanelApi}/cards`,
      {
        query: { id: stats.cards.map((card) => card.card_id).join(",") },
      },
    );
    cards.value = cardsData;
  }

  return { supabase, data, cards, wins, games, rank, fetchStats };
});
