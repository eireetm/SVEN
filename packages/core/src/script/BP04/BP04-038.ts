// BP04-038 Wordwielder Ginger — Runecraft follower, 7, 4/4. 魔法使い.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} You may put a follower from your hand onto your field. Its Fanfare abilities can't
// be performed. For the rest of this turn, it can't attack enemies (even with Storm or Rush —
// ruling).
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { putFromHandQuietly } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* putFromHandQuietly(fx, 1);
      },
    }),
  ],
});
