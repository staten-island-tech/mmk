export type PopupType = "attack" | "defense" | "poison" | "domain" | "default";

export interface BattlePopup {
  readonly id: number;
  readonly moveName: string;
  readonly damage: number | null;
  readonly player: 1 | 2;
  readonly username: string;
  readonly type: PopupType;
}

export function useBattlePopup() {
  const popups = ref<BattlePopup[]>([]);
  let nextId = 0;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;

  function show(
    moveName: string,
    damage: number | null,
    player: 1 | 2,
    username: string,
    type: PopupType = "default",
  ) {
    if (hideTimeout) clearTimeout(hideTimeout);

    const id = nextId++;

    popups.value = [{ id, moveName, damage, player, username, type }];

    hideTimeout = setTimeout(() => {
      popups.value = popups.value.filter((p) => p.id !== id);
    }, 2200);
  }

  return { popups, show };
}
