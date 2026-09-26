// BP15-PR10 Remnant of Hollowness — Swordcraft spell token, 2. 絶傑・盗賊・財宝.
// Choose 1. If there are at least 10 cards in opponents' cemeteries, choose up to 2 instead. (1) Select an enemy
// follower on the field and deal it 3 damage. If there are at least 10 cards in opponents' cemeteries, deal 8
// damage instead. (2) Look at the top 3 cards of your deck. You may reveal a Thief card from among them and add it
// to your hand. Put the rest on the bottom of your deck in any order. (Targets are selected while playing it;
// each option once; (1) needs its target — rulings.)
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { opponentsCemetery10, thief } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, p) => (opponentsCemetery10(g, p) ? 2 : 1),
      modes: [
        {
          id: "damage",
          label: "(1) 3 damage, 8 with 10 cards in the opponents' cemeteries",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, opponentsCemetery10(fx.game, fx.controller) ? 8 : 3);
          },
        },
        {
          id: "thief",
          label: "(2) A Thief card from the top 3",
          *resolve(fx) {
            yield* lookAtTopCards(fx, 3, { filter: thief, to: "hand" });
          },
        },
      ],
    }),
  ],
});
