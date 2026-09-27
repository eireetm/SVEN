// CP02-043 Hina Araki (Evolved) — 3/3.
// On Evolve - Select an iM@S CG spell that costs 2 or less in your cemetery and play it for 0 play points. (元のコスト. It goes
// to the cemetery after resolving — ruling. One that can't be played stays there, as for BP07-020.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, inYourZone, isSpell } from "../targets";
import { imas } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: (g, id) => isSpell(g, id) && imas(g, id) && costAtMost(2)(g, id) })],
      *resolve(fx) {
        const card = fx.targets[0]![0]!;
        if (fx.game.card(card)?.zone === "cemetery" && fx.game.canPlay(card, fx.controller, { cost: 0 })) yield* fx.playCard(card, { cost: 0 });
      },
    }),
  ],
});
