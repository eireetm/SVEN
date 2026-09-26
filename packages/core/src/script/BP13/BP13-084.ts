// BP13-084 Noble Phantom — Abysscraft follower, 1, 2/2. 死者.
// {[fanfare]} If there's a follower with "Ghost" in its name in your EX area, draw a card (CR 2.1.2).
import { defineCard, fanfare } from "../helpers";
import { and, isFollower, nameIncludes } from "../targets";

const ghostFollower = and(isFollower, nameIncludes("Ghost"));

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => g.cards(p, "ex").some((id) => ghostFollower(g, id)),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
