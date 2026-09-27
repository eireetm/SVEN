// ECP02-027 Mika Jougasaki [My★Style] — Runecraft follower, 4, 3/3. デレマス・パッション.
// {[fanfare]} Search your deck for an iM@S CG spell, put it into your EX area, then shuffle. It costs 3 less to play this turn.
// Activate, Lesson (1): Select an iM@S CG spell in your cemetery and put it into your EX area. It costs 3 less to play this turn.
// Activate only if there are at least 10 Passion cards in your cemetery, and only once per turn.
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { inYourZone, isSpell } from "../targets";
import { imas, inYourCemetery, intoExCheaper, passion, searchIntoExCheaper } from "./shared";

const imasSpell = (g: Parameters<typeof imas>[0], id: string) => isSpell(g, id) && imas(g, id);

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* searchIntoExCheaper(fx, imasSpell, 3);
      },
    }),
    activated(
      { custom: lesson(1) },
      {
        oncePerTurn: true,
        condition: (g, c) => inYourCemetery(g, c, passion) >= 10,
        targets: [inYourZone("cemetery", { filter: imasSpell })],
        *resolve(fx) {
          yield* intoExCheaper(fx, fx.targets[0]!, 3);
        },
      },
    ),
  ],
});
