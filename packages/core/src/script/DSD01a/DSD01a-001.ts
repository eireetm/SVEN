// DSD01a-001 Anne, Mysterian Prodigy — Runecraft follower, 6, 5/5. 魔法使い・学院・プリンセス.
// {[fanfare]} Choose one. If there are at least 10 Academic cards in your cemetery, choose up to 2 instead. (1) Search your deck for an
// Anne's Sorcery, put it into your EX area, then shuffle. The next Anne's Sorcery you play this turn costs 5 less. (2) Search your
// deck for a Grea, Mysterian Dragoness, summon it, then shuffle. (The reduction also applies when none is found and when it is played
// from outside the hand; an option once — rulings, CR 5.18.2.1.)
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { ANNES_SORCERY, academicsInCemetery } from "./shared";

export default defineCard({
  nextPlay: { annesSorcery: (g, card) => named(ANNES_SORCERY)(g, card) },
  abilities: [
    fanfare({
      modeCount: (g, c) => (academicsInCemetery(g, c) >= 10 ? 2 : 1),
      modes: [
        {
          id: "1",
          label: "Search your deck for an Anne's Sorcery (into your EX area); the next one costs 5 less",
          *resolve(fx) {
            yield* fx.search((id) => named(ANNES_SORCERY)(fx.game, id), { to: "ex" });
            yield* fx.nextPlayCostsLess("annesSorcery", 5);
          },
        },
        {
          id: "2",
          label: "Search your deck for a Grea, Mysterian Dragoness and summon it",
          *resolve(fx) {
            yield* fx.search((id) => named("Grea, Mysterian Dragoness")(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
