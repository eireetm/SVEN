// CP04-002 Kokkoro (Evolved) — Forestcraft, 2/2. プリコネ・美食殿.
// On Evolve - Draw a card.
// On Super-Evolve - Give your leader {[defense]}+2. Draw a card. (Super-evolving triggers both — rulings.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(1);
      },
    }),
  ],
});
