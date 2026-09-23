// BP01-020 Fairy Whisperer — Forestcraft follower, 2, 1/1.
// {[fanfare]} Summon a Fairy token. Put a Fairy token into your EX area.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Fairy"]);
        yield* fx.tokensToEx(["Fairy"]);
      },
    }),
  ],
});
