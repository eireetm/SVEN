import type { CardId } from "../../model/ids";
import type { Env } from "../state/access";
import { linkedCards } from "../state/links";

/**
 * CR 14.5.2 — equipment tokens (Princess Connect! Re: Dive). A token in the equipment zone is linked to the follower that
 * equips it (`CardInstance.linkedTo`, 14.5.2.2.2) and its abilities are valid only there (14.5.2.1.2). What it gives the
 * equipped follower ("The equipped follower has ...", `CardScript.equipment`) are that follower's abilities: pending instances
 * use the pseudo definition id "equip:<token definition>", with the follower as "this".
 */
export const EQUIP_PREFIX = "equip:";

/** The follower an equipment token is linked to, while that follower is on the field (the link is lost when it leaves, 14.5.2.4). */
export function equippedFollower(env: Env, token: CardId): CardId | null {
  const to = env.state.cards[token]?.linkedTo;
  return to !== undefined && env.state.cards[to]?.zone === "field" ? to : null;
}

/** The equipment tokens a card on the field has equipped (CR 14.5.2.3: several at the same time), from both players' zones. */
export function equipmentOf(env: Env, card: CardId): CardId[] {
  const players = env.state.players;
  if (players[0].zones.equipmentZone.length === 0 && players[1].zones.equipmentZone.length === 0) return [];
  return linkedCards(env, card, "equipmentZone");
}
