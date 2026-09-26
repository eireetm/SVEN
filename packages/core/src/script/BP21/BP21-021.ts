// BP21-021 Galdr, Heroic Headmaster (Evolved) — 4/4.
// On Evolve - Search your deck for an Academic follower that costs 3 or less, summon it, then shuffle. (元のコスト.)
// On Super-Evolve - Give this "If an Academic follower you control would take damage, it takes that much minus 2 instead."
// (A gained passive, CR 10.9.1.2; effects that aren't damage still work — ruling.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { costAtMost } from "../targets";
import { academicFollower } from "./shared";

const WARDING = "If an Academic follower you control would take damage, it takes that much minus 2 instead.";

export default defineCard({
  field: {
    damageToFollower: (g, self, d) => {
      if (!g.hasGainedText(self, WARDING)) return 0;
      const c = g.card(d.target);
      const mine = c?.zone === "field" && c.controller === g.card(self)!.controller;
      return mine && academicFollower(g, d.target) ? -Math.min(2, d.amount) : 0;
    },
  },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => academicFollower(fx.game, id) && costAtMost(3)(fx.game, id), { to: "field" });
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.gainText(fx.self, WARDING);
      },
    }),
  ],
});
