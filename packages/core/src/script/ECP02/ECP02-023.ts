// ECP02-023 Nagi Hisakawa [Everyday Fairy Tale] — Swordcraft follower, 1, 2/2. デレマス・パッション.
// {[fanfare]} If there are at least 5 iM@S CG cards in your cemetery, search your deck for a Sparkling☆Days, put it into your EX
// area, then shuffle. It costs 1 less to play this turn.
// Activate, {[cost02]}, engage this, bury this: Search your deck for a follower with "Nagi Hisakawa" in its name, summon it, then
// shuffle. Activate only if there are at least 10 iM@S CG cards in your cemetery.
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { followerNamed, imas, inYourCemetery, searchIntoExCheaper } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (inYourCemetery(fx.game, fx.controller, imas) >= 5) yield* searchIntoExCheaper(fx, named("Sparkling☆Days"), 1);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        condition: (g, c) => inYourCemetery(g, c, imas) >= 10,
        *resolve(fx) {
          yield* fx.search((id) => followerNamed("Nagi Hisakawa")(fx.game, id), { to: "field" });
        },
      },
    ),
  ],
});
