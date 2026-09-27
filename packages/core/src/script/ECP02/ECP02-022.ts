// ECP02-022 Chieri Ogata [Happiness Tune] (Evolved) — 3/3.
// On Evolve - Search your deck for an iM@S CG spell, reveal it, add it to your hand, then shuffle.
// {[act]} {[cost01]}, Lesson (1): The next iM@S CG spell that costs 2 or less you play this turn costs 2 less. Activate only if
// there are at least 5 Cute cards in your cemetery, and only once per turn. (元のコスト. An increase after it still applies —
// ruling.)
import { lesson } from "../costs";
import { activated, defineCard, onEvolve } from "../helpers";
import { costAtMost, isSpell } from "../targets";
import { cute, imas, inYourCemetery } from "./shared";

const NEXT = "imasSpell";

export default defineCard({
  nextPlay: { [NEXT]: (g, card) => isSpell(g, card) && imas(g, card) && costAtMost(2)(g, card) },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => isSpell(fx.game, id) && imas(fx.game, id));
      },
    }),
    activated(
      { playPoints: 1, custom: lesson(1) },
      {
        oncePerTurn: true,
        condition: (g, c) => inYourCemetery(g, c, cute) >= 5,
        *resolve(fx) {
          yield* fx.nextPlayCostsLess(NEXT, 2);
        },
      },
    ),
  ],
});
