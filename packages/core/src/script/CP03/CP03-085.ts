// CP03-085 Phantom Blaster Dragon (Evolved) — 5/4.
// Storm. Twin Drive.
// On Evolve - Select an enemy follower on the field and, if there are at least 10 Shadow Paladin cards in your cemetery, destroy
// it.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, shadowPaladin } from "./shared";

const tenShadowPaladins = (g: GameReader, p: PlayerId) => countIn(g, p, "cemetery", shadowPaladin) >= 10;

export default defineCard({
  keywords: ["storm", "twinDrive"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (tenShadowPaladins(fx.game, fx.controller)) yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
