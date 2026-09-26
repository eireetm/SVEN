// BP10-032 Honorable Thief (Evolved) — Swordcraft follower, 3/3. 盗賊.
// {[lastwords]} Draw a card.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
