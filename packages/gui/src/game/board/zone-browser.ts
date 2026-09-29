// Which pile the zone browser shows (cemetery, banished, evolve deck, ... or a Cross Craft player's two leaders), if any.
import { useSyncExternalStore } from "react";
import type { PlayerId } from "@sve/core";
import type { SideZone } from "../../engine/view-utils";

export interface OpenZone {
  player: PlayerId;
  zone: SideZone | "leader";
}

let open: OpenZone | null = null;
const listeners = new Set<() => void>();

export function openZone(zone: OpenZone | null): void {
  open = zone;
  for (const listener of listeners) listener();
}

export function useOpenZone(): OpenZone | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open,
  );
}
