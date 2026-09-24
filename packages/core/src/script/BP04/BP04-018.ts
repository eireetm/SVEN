// BP04-018 Beetle Warrior — Forestcraft follower, 3, 3/4. 狩人・虫族.
// {[fanfare]}, Combo (3): Give this follower +1/+1 and Storm.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.combo(fx.controller, 3)) return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
