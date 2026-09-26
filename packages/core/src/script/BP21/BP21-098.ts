// BP21-098 Kira, Resilient Maiden — Havencraft follower, 1, 1/2. 信仰・学院・光輝.
// Ward.
// {[fanfare]} {[cost03]} Search your deck for an Elluvia, Graceful Lady, summon it, then shuffle. (CR 10.4.7.4.)
// Activate {[engage]} this: Give your leader {[defense]}+1. Activate only if there's another Academic follower on your field.
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { leaderPlusOne } from "./shared-haven";

const elluvia = named("Elluvia, Graceful Lady");

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: playPointsCost(3),
      *resolve(fx) {
        yield* fx.search((id) => elluvia(fx.game, id), { to: "field" });
      },
    }),
    leaderPlusOne,
  ],
});
