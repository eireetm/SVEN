// BP08-115 High Enchantress — Neutral follower, 4, 4/3. 傭兵.
// Evolve (1). Fanfare: each player puts their top card into their EX area, twice. Players process
// each repetition in turn-player order (CR 1.3.4, 4.8.3.2).
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        for (let i = 0; i < 2; i++) {
          yield* fx.topToEx(1, fx.controller);
          yield* fx.topToEx(1, opponent);
        }
      },
    }),
  ],
});
