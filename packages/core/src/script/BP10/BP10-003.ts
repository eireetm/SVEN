// BP10-003 Lucille, Keeper of Relics — Forestcraft follower, 6, 4/4. 超克.
// {[fanfare]} Summon an Ancient Artifact or Mystic Artifact token. Put the other into your EX area.
// (With a full field only the other goes into the EX area — rulings.)
// Activate {[engage]}, banish 5 cards with different base costs from your EX area: You may summon a
// Spinaria & Lucille, Keepers from your evolve deck. (An advanced card, CR 9.2.)
import type { CustomCost } from "../types";
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { distinctCostsInEx } from "./shared";

const ARTIFACTS = [
  { id: "ancient", label: "Summon an Ancient Artifact; the Mystic Artifact goes into your EX area" },
  { id: "mystic", label: "Summon a Mystic Artifact; the Ancient Artifact goes into your EX area" },
];

/** "Banish 5 cards with different base costs from your EX area" (元のコストがすべて異なるように). */
const banishFiveCosts: CustomCost = {
  canPay: (g, p) => distinctCostsInEx(g, p) >= 5,
  *pay(fx) {
    const chosen: string[] = [];
    for (let i = 0; i < 5; i++) {
      const costs = chosen.map((id) => fx.game.info(id).cost);
      const left = fx.game.cards(fx.controller, "ex").filter((id) => !chosen.includes(id) && !costs.includes(fx.game.info(id).cost));
      chosen.push(...(yield* fx.chooseCards(left, 1, 1)));
    }
    yield* fx.banish(chosen);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const [pick] = yield* fx.choose(ARTIFACTS);
        const [summoned, other] = pick === "ancient" ? ["Ancient Artifact", "Mystic Artifact"] : ["Mystic Artifact", "Ancient Artifact"];
        yield* fx.summon([summoned!]);
        yield* fx.tokensToEx([other!]);
      },
    }),
    activated(
      { engageSelf: true, custom: banishFiveCosts },
      {
        *resolve(fx) {
          yield* fx.fromEvolveDeck((id) => named("Spinaria & Lucille, Keepers")(fx.game, id), { to: "field" });
        },
      },
    ),
  ],
});
