import type { CardId, PlayerId } from "../../model/ids";
import type { PlayerZone } from "../../model/state";
import type { Env } from "./access";

/**
 * Links of the collaboration zones (CR 14): Carrot cards in the race zone (14.2.1.1), Drive Point cards in the drive
 * zone (14.4.9.2) and equipment tokens (14.5.2.2.2) are linked to a card on the field (`CardInstance.linkedTo`).
 * A card whose control changed stays linked to the cards in its previous controller's zone (links are lost only when
 * it leaves the field), so both players' zones are searched.
 */
export function linkedCards(env: Env, id: CardId, zone: Extract<PlayerZone, "raceZone" | "driveZone" | "equipmentZone">): CardId[] {
  return [0, 1].flatMap((p) => env.state.players[p as PlayerId].zones[zone].filter((x) => env.state.cards[x]!.linkedTo === id));
}

/** "A racing follower" (CP01-034): it has raced and is still linked to a race-zone card (CR 14.2.3.1). */
export function isRacing(env: Env, id: CardId): boolean {
  const c = env.state.cards[id];
  return c !== undefined && c.zone === "field" && (c.raced ?? 0) > 0 && linkedCards(env, id, "raceZone").length > 0;
}
