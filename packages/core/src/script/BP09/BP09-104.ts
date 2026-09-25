// BP09-104 Marduk (Evolved) — Neutral follower, 6/6. 大神.
// On Evolve - If there are at least 5 spells in your cemetery, give your leader {[defense]}+5 and draw a
// card.
// On Evolve - If there are at least 5 amulets in your cemetery, deal 5 damage to each enemy follower on
// the field and draw a card.
// (The two resolve in any order — ruling. Each draw is part of its condition, as the English says.)
import { defineCard, onEvolve } from "../helpers";
import { isAmulet } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      condition: (g, c) => g.spellsInCemetery(c) >= 5,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 5);
        yield* fx.draw(1);
      },
    }),
    onEvolve({
      condition: (g, c) => countIn(g, c, "cemetery", isAmulet) >= 5,
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 5);
        yield* fx.draw(1);
      },
    }),
  ],
});
