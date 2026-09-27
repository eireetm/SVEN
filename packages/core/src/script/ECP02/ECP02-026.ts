// ECP02-026 Syuko Shiomi [Cinderella Girl] — Runecraft follower, 1, 2/2. デレマス・クール.
// {[fanfare]} Discard an iM@S CG card: Draw a card.
// {[act]} {[cost02]}, {[engage]}, bury this: Search your deck for a follower with "Syuko Shiomi" in its name, summon it, then
// shuffle. Activate only if there are at least 10 iM@S CG cards in your cemetery. (The engage cost is in the Japanese and official
// English texts, not in this printing's English.)
import { discardA } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { followerNamed, imas, inYourCemetery } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(imas),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        condition: (g, c) => inYourCemetery(g, c, imas) >= 10,
        *resolve(fx) {
          yield* fx.search((id) => followerNamed("Syuko Shiomi")(fx.game, id), { to: "field" });
        },
      },
    ),
  ],
});
