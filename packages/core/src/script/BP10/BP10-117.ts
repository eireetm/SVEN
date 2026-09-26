// BP10-117 Mind Splitter — Neutral follower, 2, 2/3. アルカナ・超克.
// {[fanfare]} If there are at least 4 followers on your field, put the top card of your deck into your
// EX area.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => g.followers(p).length >= 4,
      *resolve(fx) {
        yield* fx.topToEx(1);
      },
    }),
  ],
});
