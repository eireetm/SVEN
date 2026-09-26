// BP12-035 Belphomet, Worldreaver — Runecraft follower, 6, 5/5. 機械・超克.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon an Armored Tentacle token.
// {[act]} {[cost03]}, banish 2 Machina tokens from your EX area, put this card from your hand into your
// EX area: Summon an Armored Tentacle token or an Assault Tentacle token. (Valid in the hand, CR 10.3.5;
// the tokens are banished first, so a full EX area still takes this card — rulings.)
import type { CustomCost } from "../types";
import { activated, defineCard, evolveAbility, fanfare } from "../helpers";
import { and, isToken } from "../targets";
import { ARMORED, ASSAULT, countIn, machina } from "./shared";

const machinaToken = and(isToken, machina);

const banishTwoThenThisToEx: CustomCost = {
  canPay: (g, c, self) => g.card(self)?.zone === "hand" && countIn(g, c, "ex", machinaToken) >= 2,
  *pay(fx) {
    const tokens = fx.game.cards(fx.controller, "ex").filter((id) => machinaToken(fx.game, id));
    yield* fx.banish(yield* fx.chooseCards(tokens, 2, 2));
    yield* fx.putIntoEx([fx.self]);
  },
};

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([ARMORED]);
      },
    }),
    activated(
      { playPoints: 3, custom: banishTwoThenThisToEx },
      {
        validIn: ["hand"],
        *resolve(fx) {
          const [pick] = yield* fx.choose([
            { id: "armored", label: "Summon an Armored Tentacle" },
            { id: "assault", label: "Summon an Assault Tentacle" },
          ]);
          yield* fx.summon([pick === "assault" ? ASSAULT : ARMORED]);
        },
      },
    ),
  ],
});
