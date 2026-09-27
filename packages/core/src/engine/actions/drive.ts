import type { TriggerIcon } from "../../model/card";
import type { CardId, PlayerId } from "../../model/ids";
import type { EffectContext } from "../effects/context";
import type { G } from "../runtime/context";
import type { Env } from "../state/access";
import { confirm, selectCards } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { moveCards } from "../state/zones";

/** The card name of the evolve-deck resource a Ride puts into the drive zone (CR 14.4.9.2). */
export const DRIVE_POINT = "Drive Point";

/**
 * CR 14.4.5 — a drive check by `fx.controller` (for `follower`, the card whose Single / Twin Drive or effect performs it):
 *  1. the top card of their deck goes into their Trigger zone (14.4.5.1.1), revealed (a public zone, 4.15.2);
 *  2. with a deck not based on Cardfight!! Vanguard it goes to the bottom of the deck, and that's all (14.4.5.1.2);
 *  3. a card with a Trigger: the player may resolve its ability (14.4.5.1.3, 14.4.5.1.5), which is "drive checking a
 *     Trigger" (14.4.5.1.4);
 *  4. a resolved card goes to the cemetery, any other to the bottom of the deck (14.4.5.1.5).
 * Abilities triggered by the drive check wait for the next check timing, after all of it (CP03-039 / 065 rulings).
 */
export function* driveCheck(g: G, fx: EffectContext, follower: CardId | null): Proc<void> {
  const player = fx.controller;
  g.emit({ type: "driveChecked", player, follower });
  const top = g.state.players[player].zones.deck[0];
  if (top === undefined) return; // CR 1.3.2 — nothing to move
  const [card] = moveCards(g, [{ card: top, to: "triggerZone" }], "effect");
  if (card === undefined) return;
  const icon = g.state.players[player].universe === "vanguard" ? g.db.get(g.state.cards[card]!.def).trigger : undefined;
  const resolved = icon !== undefined && (yield* resolveTrigger(g, fx, card, icon));
  if (resolved) g.emit({ type: "driveTriggered", player, card, trigger: icon });
  if (g.state.cards[card]?.zone !== "triggerZone") return;
  moveCards(g, [resolved ? { card, to: "cemetery" } : { card, to: "deck", position: "bottom" }], "effect");
}

/**
 * CR 14.4.5.1.3 — the ability of a Trigger icon; the player may choose not to resolve it (14.4.5.1.5). Returns whether it
 * was resolved. A Critical or Stand Trigger needs a follower on the player's field.
 */
function* resolveTrigger(g: G, fx: EffectContext, card: CardId, icon: TriggerIcon): Proc<boolean> {
  const player: PlayerId = fx.controller;
  const followers = fx.game.followers(player);
  if ((icon === "critical" || icon === "stand") && followers.length === 0) return false;
  if (!(yield* confirm(g, player, "driveTrigger", card))) return false;
  switch (icon) {
    case "critical": {
      // 14.4.5.1.3.1 — a follower on their field +2 attack.
      const [target] = yield* selectCards(g, player, "pick", followers, 1, 1, card);
      if (target !== undefined) yield* fx.giveStats(target, 2, 0);
      break;
    }
    case "draw":
      yield* fx.draw(1); // 14.4.5.1.3.2
      break;
    case "stand": {
      // 14.4.5.1.3.3 — refresh a follower on their field; it can't attack an enemy leader for the rest of the turn.
      const [target] = yield* selectCards(g, player, "pick", followers, 1, 1, card);
      if (target !== undefined) {
        yield* fx.refresh([target]);
        yield* fx.cannotAttackLeader(target, "endOfTurn");
      }
      break;
    }
    case "heal":
      yield* fx.giveLeaderDefense(player, 3); // 14.4.5.1.3.4
      break;
  }
  return true;
}

/** Facedown Drive Point cards in the player's evolve deck, which a Ride uses (CR 14.4.9.2; faceup ones aren't in it, 4.6.3). */
export function drivePointsToRide(env: Env, player: PlayerId): CardId[] {
  return env.state.players[player].zones.evolveDeck.filter((id) => {
    const c = env.state.cards[id]!;
    return !c.faceUp && env.db.get(c.def).name === DRIVE_POINT;
  });
}

/**
 * CR 14.4.9.2 — can this card pay the part every Ride cost has: its Ride hasn't been activated this game, and a Drive Point
 * can be put into the drive zone linked to it?
 */
export function canRide(env: Env, card: CardId): boolean {
  const c = env.state.cards[card];
  return c !== undefined && c.zone === "field" && c.rideUsed !== true && drivePointsToRide(env, c.controller).length > 0;
}

/** Pay it: a Drive Point into the drive zone, linked to the card (14.4.9.2); the card remembers its Ride for the game. */
export function ride(g: G, card: CardId): boolean {
  if (!canRide(g, card)) return false;
  const c = g.state.cards[card]!;
  const [point] = drivePointsToRide(g, c.controller);
  moveCards(g, [{ card: point!, to: "driveZone", player: c.controller, linkTo: card }], "effect");
  c.rideUsed = true;
  return true;
}
