// Abilities shared by several BP04 cards (not a card: the file name has no set prefix).
import type { CardId } from "../../model/ids";
import type { EffectContext } from "../../engine/effects/context";
import type { GameReader } from "../../engine/query";
import type { Proc } from "../../engine/runtime/proc";
import type { AutomaticAbility, CustomCost } from "../types";
import { isAmulet, isFollower } from "../targets";

/**
 * BP04-003 / 004 "When this follower deals attack damage to an enemy leader, you win the game"
 * (CR 5.23.1). Damage of 0 or less is not dealt, so an attack with 0 attack wins nothing (ruling).
 */
export const winOnLeaderAttackDamage: AutomaticAbility = {
  kind: "automatic",
  timing: "other",
  trigger: (e, me, game) =>
    !me.lookBack &&
    e.type === "damageDealt" &&
    e.source === me.card &&
    e.kind === "attack" &&
    game.card(e.target)?.zone === "leader" &&
    game.controller(e.target) !== me.controller,
  *resolve(fx) {
    yield* fx.winGame();
  },
};

/**
 * BP04-038 / 039 — put up to `max` followers from your hand onto your field. Their Fanfare
 * abilities can't be performed, and for the rest of this turn they can't attack enemies (even
 * with Storm or Rush — ruling; CR 8.4.3.2.1).
 */
export function* putFromHandQuietly(fx: EffectContext, max: number): Proc<void> {
  const hand = fx.game.cards(fx.controller, "hand").filter((id) => isFollower(fx.game, id));
  if (hand.length === 0) return;
  const chosen = yield* fx.selectCards(hand, 0, Math.min(max, hand.length));
  for (const id of yield* fx.putOntoField(chosen)) {
    yield* fx.blockFanfare(id);
    yield* fx.cannotAttack(id, "endOfTurn");
  }
}

const reservedAmulets = (g: GameReader, player: number) =>
  g.cards(player as 0 | 1, "field").filter((id) => isAmulet(g, id) && g.card(id)?.engaged === false);

/** "{[engage]} 2 amulets on your field" as a cost (BP04-106, 110): two reserved amulets (CR 10.4.6). */
export const engageTwoAmulets: CustomCost = {
  canPay: (g, c) => reservedAmulets(g, c).length >= 2,
  *pay(fx) {
    yield* fx.engage(yield* fx.chooseCards(reservedAmulets(fx.game, fx.controller), 2, 2));
  },
};

/** "Put 2 cards named [name] from your field into their owners' cemeteries" as a cost (BP04-079). */
export function buryTwoNamed(name: string): CustomCost {
  const mine = (g: GameReader, player: number) =>
    g.cards(player as 0 | 1, "field").filter((id: CardId) => g.info(id).names.includes(name));
  return {
    canPay: (g, c) => mine(g, c).length >= 2,
    *pay(fx) {
      yield* fx.bury(yield* fx.chooseCards(mine(fx.game, fx.controller), 2, 2));
    },
  };
}
