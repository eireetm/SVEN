// BP02-080 Trick Dullahan — Abysscraft follower, 2, 3/2.
// {[fanfare]} Put a Ghost token into your EX area. Necrocharge (10): Put 3 instead. (CR 13.5.1)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const n = fx.game.necrocharge(fx.controller, 10) ? 3 : 1;
        yield* fx.tokensToEx(Array<string>(n).fill("Ghost"));
      },
    }),
  ],
});
