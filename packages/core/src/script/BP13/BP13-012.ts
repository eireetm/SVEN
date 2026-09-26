// BP13-012 Tree of Wonders — Forestcraft amulet, 2. 妖精.
// {[fanfare]} Put a Fairy token into your EX area.
// Activate {[engage]}, bury this card: Draw 2 cards. Activate only if there are at least 3 Pixie followers
// in your EX area.
import { activated, defineCard, fanfare } from "../helpers";
import { and, isFollower } from "../targets";
import { FAIRY, countIn, pixie } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY]);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => countIn(g, c, "ex", and(isFollower, pixie)) >= 3,
        *resolve(fx) {
          yield* fx.draw(2);
        },
      },
    ),
  ],
});
