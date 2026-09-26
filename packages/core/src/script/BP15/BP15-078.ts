// BP15-078 Rulenye, Screaming Silence — Abysscraft follower, 2, 2/1. 絶傑・死霊術師.
// Rush. Assail.
// {[fanfare]} Select an enemy follower on the field. If there are at least 3 cards on your field named Rulenye,
// Echoing Scream, destroy it and deal 3 damage to its leader. (Both under the condition — Q10.)
// {[lastwords]} Put a Scream Diffusion token into your EX area. Bury the top card of your deck.
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower, named } from "../targets";
import { countIn } from "./shared";
import { ECHOING_SCREAM } from "./shared-abyss";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "field", named(ECHOING_SCREAM)) < 3) return;
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        yield* fx.dealDamage(leader, 3);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx(["Scream Diffusion"]);
        yield* fx.mill(1);
      },
    }),
  ],
});
