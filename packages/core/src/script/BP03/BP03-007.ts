// BP03-007 Elf Twins' Assault — Forestcraft spell, 2. エルフ族. Quick.
// Select up to 2 enemy followers and deal X damage divided between them.
// X equals the number of cards in your EX area.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        const x = fx.game.cards(fx.controller, "ex").length;
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], x);
      },
    }),
  ],
});
