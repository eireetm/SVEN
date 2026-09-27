// CP02-105 Master Trainer — Neutral follower, 8, 4/4. デレマス.
// {[fanfare]} Put 5 Magical Item tokens into your EX area. Recover 4 play points. (As many as the EX area holds; the play points
// are recovered anyway — ruling; CR 4.8.3.2.)
import { MAGICAL_ITEM } from "../../data/universes";
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(Array<string>(5).fill(MAGICAL_ITEM));
        yield* fx.recoverPlayPoints(4);
      },
    }),
  ],
});
