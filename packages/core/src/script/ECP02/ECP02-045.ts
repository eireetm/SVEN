// ECP02-045 Hotaru Shiragiku [Unbreakable] (Evolved) — 3/3.
// On Evolve - Search your deck for an iM@S CG follower with 1 attack, reveal it, add it to your hand, then shuffle.
// At the start of your end phase, select a follower on your field and, if there are at least 5 Cute cards in your cemetery, give
// it {[defense]}+2. (This printing's English says "give i".)
import { atStartOfYourEndPhase, defineCard, onEvolve } from "../helpers";
import { yourFollower } from "../targets";
import { cute, followerThat, imas, inYourCemetery } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => followerThat(imas)(fx.game, id) && fx.game.info(id).attack === 1);
      },
    }),
    atStartOfYourEndPhase({
      targets: [yourFollower()],
      *resolve(fx) {
        if (inYourCemetery(fx.game, fx.controller, cute) >= 5) yield* fx.giveStats(fx.targets[0]![0]!, 0, 2);
      },
    }),
  ],
});
