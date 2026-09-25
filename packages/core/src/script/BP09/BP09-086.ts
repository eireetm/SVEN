// BP09-086 Jeanne, Beacon of Salvation — Havencraft follower, 3, 2/3. 信仰・先導.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Draw a card. If there are at least 2 followers with "Jeanne" in their name in your
// cemetery, give this follower {[attack]}+1/{[defense]}+1 and Storm.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, isFollower, nameIncludes } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        const jeannes = countIn(fx.game, fx.controller, "cemetery", and(isFollower, nameIncludes("Jeanne")));
        if (jeannes >= 2 && fx.game.card(fx.self)?.zone === "field") {
          yield* fx.giveStats(fx.self, 1, 1);
          yield* fx.giveKeyword(fx.self, "storm");
        }
      },
    }),
  ],
});
