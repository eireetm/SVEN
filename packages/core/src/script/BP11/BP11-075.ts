// BP11-075 Dead to Rights — Abysscraft spell, 1. 荒野・死者・魔界.
// Activate Banish this card and an Iceschillendrig, Gilded Autocrat from your cemetery: Select an enemy
// follower on the field and engage it. (Valid in the cemetery — ruling, CR 10.3.5.)
// ----------
// {[quick]}
// Select an enemy follower on the field and give it {[attack]}-2/{[defense]}-2. (Attack can go below 0,
// and such a follower deals no damage — rulings.)
import type { CustomCost } from "../types";
import { activated, defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";

const ICE = named("Iceschillendrig, Gilded Autocrat");

const banishThisAndIce: CustomCost = {
  canPay: (g, c, self) => g.card(self)?.zone === "cemetery" && g.cards(c, "cemetery").some((id) => ICE(g, id)),
  *pay(fx) {
    const ices = fx.game.cards(fx.controller, "cemetery").filter((id) => ICE(fx.game, id));
    const [ice] = yield* fx.chooseCards(ices, 1, 1);
    yield* fx.banish([fx.self, ...(ice === undefined ? [] : [ice])]);
  },
};

export default defineCard({
  keywords: ["quick"],
  abilities: [
    activated(
      { custom: banishThisAndIce },
      {
        validIn: ["cemetery"],
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.engage(fx.targets[0]!);
        },
      },
    ),
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -2, -2);
      },
    }),
  ],
});
