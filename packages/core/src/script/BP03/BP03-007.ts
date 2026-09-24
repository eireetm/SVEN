// BP03-007 Elf Twins' Assault — Forestcraft spell, 2. エルフ族. Quick.
// Select up to 2 enemy followers and deal X damage divided between them.
// X equals the number of cards in your EX area.
// Each selected follower must be dealt at least 1 (rulings BP08-028 / EBD02-015), so at most X
// followers can be selected. The spell is already in the resolution zone when they are selected,
// and nothing changes the EX area before the damage, so X is the same then.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

const x = (g: GameReader, p: PlayerId) => g.cards(p, "ex").length;

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true, max: x })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], x(fx.game, fx.controller));
      },
    }),
  ],
});
