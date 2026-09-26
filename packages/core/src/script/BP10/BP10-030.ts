// BP10-030 Knight Neilan the Lazy — Swordcraft follower, 4, 4/4. 兵士・童話.
// Ward.
// Each follower with 1 attack on your field has Aura.
// {[fanfare]} Choose one. (1) Select an enemy follower on the field and deal it 3 damage. (2) Search
// your deck for a Fable follower that costs 2 or less, summon it, then shuffle. ((1) can't be chosen
// without a target — ruling. 元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, enemyFollower, hasTrait, isFollower } from "../targets";

const cheapFable = and(isFollower, hasTrait("童話"), costAtMost(2));

export default defineCard({
  keywords: ["ward"],
  field: {
    keywordsFor: (g, self, card) =>
      g.controller(card) === g.controller(self) && g.typeAndTraits(card).type === "follower" && g.statsOf(card).attack === 1 ? ["aura"] : [],
  },
  abilities: [
    fanfare({
      modes: [
        {
          id: "damage",
          label: "(1) Deal 3 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          },
        },
        {
          id: "fable",
          label: "(2) Summon a Fable follower that costs 2 or less from your deck",
          *resolve(fx) {
            yield* fx.search((id) => cheapFable(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
