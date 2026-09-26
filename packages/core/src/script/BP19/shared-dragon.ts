// Shared pieces of BP19 Dragoncraft card scripts (not a card: the file name has no set prefix).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import type { TimingSpec } from "../helpers";
import { lastWords } from "../helpers";
import { enemyFollower } from "../targets";
import { condemned } from "./shared";

/** "This can't be played from the EX area." (BP19-056, 057, 060, 063, 064, 066.) */
export const notFromEx = (g: GameReader, self: CardId): boolean => g.playZone(self) !== "ex";

/** "{[lastwords]} Put this into its owner's EX area." (A full EX area leaves it in the cemetery — rulings, CR 4.8.3.2.) */
export const backToEx = lastWords({
  *resolve(fx) {
    if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putIntoEx([fx.self]);
  },
});

/** "Bury N Condemned cards in your EX area" as a cost (BP19-056, 058, 060). */
export const buryCondemnedFromEx = (n: number): CustomCost => ({
  canPay: (g, c) => g.cards(c, "ex").filter((id) => condemned(g, id)).length >= n,
  *pay(fx) {
    const cards = fx.game.cards(fx.controller, "ex").filter((id) => condemned(fx.game, id));
    yield* fx.bury(yield* fx.chooseCards(cards, n, n));
  },
});

/** BP19-068 / 069 "Strike - Select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1." */
export const crabPinch: TimingSpec = {
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.giveStats(fx.targets[0]![0]!, -1, -1);
  },
};
