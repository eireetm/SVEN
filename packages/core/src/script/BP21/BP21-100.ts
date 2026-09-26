// BP21-100 Pureflame Lady — Havencraft follower, 3, 1/1. 信仰・学院・光輝.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever this gains {[defense]}, deal 1 damage to each enemy follower on the field. (Not by evolving; on the opponent's
// turn too — rulings.)
// {[fanfare]} If there's another Academic follower on your field, give this {[attack]}+1/{[defense]}+1.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { anotherAcademicFollower, pureflame } from "./shared-haven";

export default defineCard({
  abilities: [
    evolveAbility(1),
    pureflame,
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field" && anotherAcademicFollower(fx.game, fx.controller, fx.self)) yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
