// ECP02-001 Anastasia [Seize the Light] — Forestcraft follower, 2, 1/1. デレマス・クール.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} {[cost01]}, Lesson (1) - You may put an iM@S CG follower that costs 2 or less from your hand into your EX area. It
// costs 2 less to play this turn. (元のコスト. Lesson may banish a Magical Item from a full EX area and so make room — ruling.)
import { allCosts, lesson, playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtMost } from "../targets";
import { followerThat, imas, intoExCheaper } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: allCosts(playPointsCost(1), lesson(1)),
      *resolve(fx) {
        const g = fx.game;
        const fits = g.cards(fx.controller, "hand").filter((id) => followerThat(imas)(g, id) && costAtMost(2)(g, id));
        yield* intoExCheaper(fx, yield* fx.chooseCards(fits, 0, 1), 2);
      },
    }),
  ],
});
