// BP21-039 Anne, Brilliant Mage (Evolved) — 4/4.
// On Evolve - Summon an Anne's Summoning token and, if there are at least 10 Academic cards in your cemetery, give it Assail.
// On Super-Evolve - Search your deck for an Anne's Sorcery, reveal it, add it to your hand, then shuffle. The next Anne's
// Sorcery you play this turn costs 5 less. (From any zone; also when none is found — rulings. Anne's Sorcery is DSD01a-008,
// not in the supported sets yet.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { named } from "../targets";
import { academicsInCemetery } from "./shared";

const sorcery = named("Anne's Sorcery");

export default defineCard({
  nextPlay: { sorcery: (g, card) => sorcery(g, card) },
  abilities: [
    onEvolve({
      *resolve(fx) {
        const [token] = yield* fx.summon(["Anne's Summoning"]);
        if (token !== undefined && academicsInCemetery(fx.game, fx.controller) >= 10) yield* fx.giveKeyword(token, "assail");
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.search((id) => sorcery(fx.game, id), { to: "hand" });
        yield* fx.nextPlayCostsLess("sorcery", 5);
      },
    }),
  ],
});
