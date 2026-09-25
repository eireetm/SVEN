// BP06-060 Wyrm God of the Skies (Evolved) — Dragoncraft follower, 5/5. ドラゴニュート・竜族.
// On Evolve: Give your leader {[defense]}+3.
// {[lastwords]} Put this card into its owner's EX area. (The unevolved card goes there; the evolved
// card goes to the evolve deck faceup first — ruling.)
import { defineCard, lastWords, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
    lastWords({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
