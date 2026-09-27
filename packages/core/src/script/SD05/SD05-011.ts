// SD05-011 Lesser Mummy (Evolved) — 3/3.
// Strike: Summon a Ghost token. (Nothing with a full field — ruling.)
import { defineCard, strike } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.summon(["Ghost"]);
      },
    }),
  ],
});
