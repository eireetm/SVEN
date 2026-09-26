// BP12-080 Bloodstained Berserker — Abysscraft follower, 6, 5/4. 魔界.
// {[evolve]} {[cost02]}: Evolve this follower.
// Storm.
// {[fanfare]} Give this follower {[attack]}+X/{[defense]}+X, where X equals the number of cards named
// Bloodstained Berserker in your cemetery.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        const x = countIn(fx.game, fx.controller, "cemetery", named("Bloodstained Berserker"));
        if (x > 0 && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, x, x);
      },
    }),
  ],
});
