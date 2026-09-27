// ECP02-006 Riina Tada [Wannabe Legend] — Forestcraft follower, 5, 4/4. デレマス・クール.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Search your deck for an iM@S CG amulet that costs 1, summon it, then shuffle. (元のコスト.)
// Activate, Lesson (1): You may summon an iM@S CG follower that costs 1 or less or iM@S CG amulet that costs 1 or less from your
// hand.
import { lesson } from "../costs";
import { activated, defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtMost, isAmulet, isFollower } from "../targets";
import { imas, maySummonFromHand } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isAmulet(g, id) && imas(g, id) && g.info(id).cost === 1, { to: "field" });
      },
    }),
    activated(
      { custom: lesson(1) },
      {
        *resolve(fx) {
          yield* maySummonFromHand(fx, (g, id) => (isFollower(g, id) || isAmulet(g, id)) && imas(g, id) && costAtMost(1)(g, id));
        },
      },
    ),
  ],
});
