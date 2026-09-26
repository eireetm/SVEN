// Shared pieces of BP16 Dragoncraft card scripts (not a card: the file name has no set prefix).
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import type { TimingSpec } from "../helpers";
import { and, costAtLeast, enemyFollower, isClass } from "../targets";
import { countIn } from "./shared";

/** "{[dragoncraft]} cards in your cemetery that cost 7 or more" (元のコスト; BP16-057, 058, 067). */
export const bigDragonsInCemetery = (g: GameReader, p: PlayerId): number => countIn(g, p, "cemetery", and(isClass("Dragoncraft"), costAtLeast(7)));

/** "If you have 10 max play points" (BP16-056, 071). */
export const tenMaxPlayPoints = (g: GameReader, p: PlayerId): boolean => g.state.players[p].maxPlayPoints === 10;

/** "Discard a card:" — another card than this one — remembering its cost for the effect (BP16-057, 058). */
const discardACardForItsCost: CustomCost = {
  canPay: (g, c, self) => g.cards(c, "hand").some((id) => id !== self),
  *pay(fx) {
    const [card] = yield* fx.chooseCards(fx.game.cards(fx.controller, "hand").filter((id) => id !== fx.self), 1, 1);
    if (card === undefined) return;
    fx.memory.discardedCost = fx.game.info(card).cost ?? 0;
    yield* fx.discardCards([card]);
  },
};

/**
 * BP16-057 / 058 "Discard a card: Select an enemy follower on the field. Deal it damage equal to the discarded
 * card's cost and draw a card." (Not without a target — rulings; CR 10.4.7.4.)
 */
export const burniteFlames: TimingSpec = {
  cost: discardACardForItsCost,
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.dealDamage(fx.targets[0]![0]!, Number(fx.memory.discardedCost ?? 0));
    yield* fx.draw(1);
  },
};
