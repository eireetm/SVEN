// CP02-070 Ranko Kanzaki (Evolved) — 4/4.
// On Evolve - Look at the top 4 cards of your deck. You may put one of them into your EX area. Bury the rest.
// {[act]} {[cost01]}, Lesson (2): Select up to 2 enemy followers on the field and deal them 2 damage.
import { lesson } from "../costs";
import { activated, defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: () => true, to: "ex", rest: "cemetery" });
      },
    }),
    activated(
      { playPoints: 1, custom: lesson(2) },
      {
        targets: [enemyFollower({ count: 2, upTo: true })],
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.targets[0] ?? [], 2);
        },
      },
    ),
  ],
});
