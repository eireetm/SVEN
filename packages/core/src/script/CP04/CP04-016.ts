// CP04-016 Nebbia — Forestcraft follower, 2, 3/2. プリコネ.
// {[ub]} Strike - For the rest of this turn, this doesn't take damage.
// Rush.
// {[fanfare]} Put another card from your field into its owner's EX area: Select an enemy follower on the field and engage it.
// (Without an enemy follower it can't be played, so nothing is paid — ruling. The card must fit into that EX area, CR 10.6.2.5.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { defineCard, fanfare, strike, ub } from "../helpers";
import { enemyFollower } from "../targets";

const others = (g: GameReader, c: PlayerId, self: CardId) =>
  g.cards(c, "field").filter((id) => {
    if (id === self) return false;
    const owner = g.card(id)!.owner;
    return g.cards(owner, "ex").length < g.exAreaLimit(owner);
  });

const anotherToEx: CustomCost = {
  canPay: (g, c, self) => others(g, c, self).length > 0,
  *pay(fx) {
    yield* fx.putIntoEx(yield* fx.chooseCards(others(fx.game, fx.controller, fx.self), 1, 1));
  },
};

export default defineCard({
  keywords: ["rush"],
  abilities: [
    ub(
      strike({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.preventDamage(fx.self, "all", "endOfTurn");
        },
      }),
    ),
    fanfare({
      cost: anotherToEx,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage([fx.targets[0]![0]!]);
      },
    }),
  ],
});
