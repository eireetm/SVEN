// BP03-041 Falise, Leonardian Mage — Runecraft follower, 4, 4/5. 魔法使い・学院.
// {[fanfare]}, Earth Rite: Give this follower Storm.
// {[fanfare]}, Spellchain (7): Deal 4 to each enemy follower.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      earthRite: { mode: "optional" },
      *resolve(fx) {
        if (fx.earthRitePaid) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
    fanfare({
      *resolve(fx) {
        if (!fx.game.spellchain(fx.controller, 7)) return;
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 4);
      },
    }),
  ],
});
