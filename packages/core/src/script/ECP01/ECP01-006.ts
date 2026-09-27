// ECP01-006 Yamamin Zephyr — Forestcraft follower, 4, 3/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// Ward.
// {[fanfare]} Choose one. If this card was put onto the field by an Umamusume card's ability, choose up to 2 instead.
// (1) Select an enemy follower on the field and return it to its owner's hand. (2) Search your deck for an Umamusume follower
// that costs 2 or less, summon it, then shuffle. (元のコスト. Put onto the field by Teio-Oo-Oo!!! counts; without an enemy
// follower (1) can't be chosen; an option can't be chosen twice — rulings.)
import { defineCard, enteredByCardThat, fanfare, serveAbility } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";
import { umamusumeFollower } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      modeCount: (g, _c, self) => (enteredByCardThat(g, self, (by) => by.traits.includes("ウマ娘")) ? 2 : 1),
      modes: [
        {
          id: "return",
          label: "Return an enemy follower to its owner's hand",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.returnToHand(fx.targets[0]!);
          },
        },
        {
          id: "search",
          label: "Summon an Umamusume follower that costs 2 or less from your deck",
          *resolve(fx) {
            const g = fx.game;
            yield* fx.search((id) => umamusumeFollower(g, id) && costAtMost(2)(g, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
