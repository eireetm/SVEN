// CP02-020 Nagi Hisakawa — Swordcraft follower, 4, 4/4. デレマス・パッション.
// {[fanfare]} Banish two 1-cost cards from your cemetery: Choose up to 2 of the following. (1) Select an enemy follower on the
// field and destroy it. (2) Deal 2 damage to each enemy leader. (3) Draw a card. Discard a card.
// {[act]} {[cost01]}, Lesson (1): Give this follower Rush.
// (Rulings: without an enemy follower (1) can't be chosen; the options are chosen first and the cost may then be left
// unpaid, and then nothing happens (CR 10.4.7.4); an option is chosen at most once (5.18.2.1). 元のコスト.)
import { banishFromYour, lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEnemyLeader } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYour(["cemetery"], (g, id) => g.info(id).cost === 1, 2),
      modeCount: () => 2,
      modes: [
        {
          id: "1",
          label: "Destroy an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "2",
          label: "Deal 2 damage to each enemy leader",
          *resolve(fx) {
            yield* damageEnemyLeader(fx, 2);
          },
        },
        {
          id: "3",
          label: "Draw a card, then discard a card",
          *resolve(fx) {
            yield* fx.draw(1);
            yield* fx.discard(fx.controller, 1, 1);
          },
        },
      ],
    }),
    activated(
      { playPoints: 1, custom: lesson(1) },
      {
        *resolve(fx) {
          yield* fx.giveKeyword(fx.self, "rush");
        },
      },
    ),
  ],
});
