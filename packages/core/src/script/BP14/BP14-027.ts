// BP14-027 Masterful Musician (Evolved) — Swordcraft follower, 4/4. 宴楽・盗賊.
// Whenever a Glittering Gold token is put into your EX area, select an enemy follower on the field. Deal 3
// damage to it and 1 damage to its leader. (Once per token — ruling.)
// On Evolve - Put a Glittering Gold token into your EX area.
import { defineCard, onEvolve, whenCardPutIntoYourEx } from "../helpers";
import { enemyFollower, named } from "../targets";
import { GLITTERING_GOLD } from "./shared";

export default defineCard({
  abilities: [
    whenCardPutIntoYourEx(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.dealDamages([
            { target, amount: 3 },
            { target: fx.game.leader(fx.game.controller(target)), amount: 1 },
          ]);
        },
      },
      named(GLITTERING_GOLD),
    ),
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx([GLITTERING_GOLD]);
      },
    }),
  ],
});
