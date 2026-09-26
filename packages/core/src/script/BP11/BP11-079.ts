// BP11-079 Wretched Tryst — Abysscraft spell, 4. 荒野・死者・魔界.
// Select 2 Wasteland followers that cost 3 or less in your cemetery. Necrocharge (10) - Summon them.
// (Playable without Necrocharge, then nothing; not with fewer than 2 — rulings.)
import { defineCard, spell } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { wastelandFollower } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { count: 2, filter: and(wastelandFollower, costAtMost(3)) })],
      *resolve(fx) {
        if (fx.game.necrocharge(fx.controller, 10)) yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
