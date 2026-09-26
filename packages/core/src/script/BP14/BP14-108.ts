// BP14-108 Glistering Angel — Neutral follower, 2, 2/2. 天使.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} If there are at least 5 Angel cards in your cemetery, give your leader {[defense]}+2.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { hasTrait } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => countIn(g, p, "cemetery", hasTrait("天使")) >= 5,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
