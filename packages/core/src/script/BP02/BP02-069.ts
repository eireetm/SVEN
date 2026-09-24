// BP02-069 Vania, Vampire Princess — Abysscraft follower, 2, 2/2.
// (Also printed as BP02-070 / BP02-SP01 "La+ Darkness, Laplace's Demon": a collab name; the card
// is treated as Vania — ruling, CR 2.13.)
// {[fanfare]} Give this follower {[attack]}+X/{[defense]}+X. X equals the number of Forest Bat tokens
// on your field (when it resolves; later Forest Bats do not count — ruling).
// {[act]}{[cost01]}, put a Forest Bat token from your field into your cemetery: Select an enemy
// follower on the field. Deal 3 damage to it and 1 damage to its leader.
import { activated, defineCard, fanfare } from "../helpers";
import { buryFromYourField } from "../costs";
import { and, enemyFollower, isToken, named } from "../targets";

const forestBat = and(isToken, named("Forest Bat"));

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const x = fx.game.cards(fx.controller, "field").filter((id) => forestBat(fx.game, id)).length;
        yield* fx.giveStats(fx.self, x, x);
      },
    }),
    activated(
      { playPoints: 1, custom: buryFromYourField(forestBat) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const leader = fx.game.leader(fx.game.controller(target));
          yield* fx.dealDamages([
            { target, amount: 3 },
            { target: leader, amount: 1 },
          ]);
        },
      },
    ),
  ],
});
