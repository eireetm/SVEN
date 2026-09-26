// BP19-115 Ironforged Right Hand — Neutral follower, 2, 3/2. 八獄・超克.
// {[fanfare]} Draw a card. If there's a follower with "Cutthroat" in its name on your field or in your cemetery, recover 2
// play points.
import { defineCard, fanfare } from "../helpers";
import { cutthroatAround } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        if (cutthroatAround(fx.game, fx.controller)) yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
