// BP12-023 Alwida, Pirate Queen — Swordcraft follower, 5, 5/5. 指揮官・盗賊.
// {[fanfare]} Choose one. (1) The next Alwida's Command you play this turn costs 5 less. (2) The next
// Thief card you play this turn costs 3 less.
// Whenever a Thief follower on your field attacks, select an enemy follower on the field and deal it 4
// damage. Its controller buries the top card of their deck. (It resolves before the quick timing —
// ruling.)
import { defineCard, fanfare, whenYourFollowerAttacks } from "../helpers";
import { enemyFollower, named } from "../targets";
import { thief } from "./shared";

export default defineCard({
  nextPlay: {
    command: (g, card) => named("Alwida's Command")(g, card),
    thief: (g, card) => thief(g, card),
  },
  abilities: [
    fanfare({
      modes: [
        {
          id: "command",
          label: "(1) The next Alwida's Command costs 5 less",
          *resolve(fx) {
            yield* fx.nextPlayCostsLess("command", 5);
          },
        },
        {
          id: "thief",
          label: "(2) The next Thief card costs 3 less",
          *resolve(fx) {
            yield* fx.nextPlayCostsLess("thief", 3);
          },
        },
      ],
    }),
    whenYourFollowerAttacks(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const controller = fx.game.controller(target);
          yield* fx.dealDamage(target, 4);
          yield* fx.mill(1, controller);
        },
      },
      thief,
    ),
  ],
});
