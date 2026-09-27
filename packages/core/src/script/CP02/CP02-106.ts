// CP02-106 Expert Trainer — Neutral follower, 4, 4/4. デレマス.
// {[fanfare]} Put 2 Magical Item tokens into your EX area. (As many as the EX area holds, CR 4.8.3.2.)
import { MAGICAL_ITEM } from "../../data/universes";
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([MAGICAL_ITEM, MAGICAL_ITEM]);
      },
    }),
  ],
});
