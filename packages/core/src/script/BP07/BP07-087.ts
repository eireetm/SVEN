// BP07-087 Limonia, Flawed Saint (Evolved) — 5/4.
// On Evolve: Destroy each enemy follower on the field.
// {[act]} {[cost00]}: Select a Machina follower that costs 2 or less in your cemetery and summon it.
// Activate only once per turn. (元のコスト.)
import { activated, defineCard, onEvolve } from "../helpers";
import { and, costAtMost, inYourZone, isFollower } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.destroy(fx.game.followers(fx.game.opponent(fx.controller)));
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        targets: [inYourZone("cemetery", { filter: and(isFollower, machina, costAtMost(2)) })],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets[0]!);
        },
      },
    ),
  ],
});
