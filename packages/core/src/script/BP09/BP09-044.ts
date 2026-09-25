// BP09-044 Palla, Student Teacher — Runecraft follower, 3, 3/3. 魔法使い・学院.
// {[fanfare]} Draw a card. If there are at least 5 Academic cards in your cemetery, recover 1 play
// point.
import { defineCard, fanfare } from "../helpers";
import { academic, countIn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        if (countIn(fx.game, fx.controller, "cemetery", academic) >= 5) yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
