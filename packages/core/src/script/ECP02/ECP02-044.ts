// ECP02-044 Hotaru Shiragiku [Unbreakable] — Dragoncraft follower, 2, 2/2. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this.
// At the start of your end phase, select a follower on your field and, if there are at least 5 Cute cards in your cemetery, give
// it {[defense]}+2.
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";
import { yourFollower } from "../targets";
import { cute, inYourCemetery } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    atStartOfYourEndPhase({
      targets: [yourFollower()],
      *resolve(fx) {
        if (inYourCemetery(fx.game, fx.controller, cute) >= 5) yield* fx.giveStats(fx.targets[0]![0]!, 0, 2);
      },
    }),
  ],
});
