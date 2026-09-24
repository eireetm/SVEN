// BP04-026 Cyclone Blade — Swordcraft spell, 3. 指揮官.
// (BP04-027 is the same card.)
// Select a Commander follower on your field and deal X damage to each enemy follower on the
// field. X equals the selected follower's attack, including changes to it (ruling).
import { defineCard, spell } from "../helpers";
import { hasTrait, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: hasTrait("指揮官") })],
      *resolve(fx) {
        const x = fx.game.info(fx.targets[0]![0]!).attack ?? 0;
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), x);
      },
    }),
  ],
});
