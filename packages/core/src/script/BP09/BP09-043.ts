// BP09-043 Bergent, Onion Patchmaster (Evolved) — Runecraft follower, 4/4. 魔法使い・魔法生物.
// While this card is on your field, if an Onion Patch on your field would deal damage, it deals that
// much plus 1 instead. (Attack, combat and ability damage — its Strike too; two of them give +2; 0
// damage stays no damage; with other damage changes the damaged card's player picks the order —
// rulings, CR 10.10.2. Like BP06-074.)
// {[act]} {[cost01]}, {[engage]}: Search your deck for up to 2 cards named Onion Patch, summon them,
// then shuffle your deck.
import { activated, defineCard } from "../helpers";
import { named } from "../targets";
import { ONION } from "./shared";

const onion = named(ONION);

export default defineCard({
  field: {
    damageBy: (g, self, damage) =>
      damage.source !== null &&
      g.card(damage.source)?.zone === "field" &&
      g.controller(damage.source) === g.controller(self) &&
      onion(g, damage.source)
        ? 1
        : 0,
  },
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.search((id) => onion(fx.game, id), { max: 2, to: "field" });
        },
      },
    ),
  ],
});
