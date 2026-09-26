// BP17-001 Arisa, Evergreen Arrow — Forestcraft follower, 1, 2/2. エルフ族.
// {[fanfare]} Put a Gale Arrow or Storm Arrow token into your EX area.
// Activate {[engage]} this: Search your deck for a Forest Guardian's Bow, summon it, then shuffle. Activate only if
// you've played at least 5 cards this turn. (CR 13.2.1.)
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const [pick] = yield* fx.choose([
          { id: "Gale Arrow", label: "Gale Arrow" },
          { id: "Storm Arrow", label: "Storm Arrow" },
        ]);
        yield* fx.tokensToEx([pick === "Storm Arrow" ? "Storm Arrow" : "Gale Arrow"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, p) => g.playedThisTurn(p) >= 5,
        *resolve(fx) {
          yield* fx.search((id) => named("Forest Guardian's Bow")(fx.game, id), { to: "field" });
        },
      },
    ),
  ],
});
