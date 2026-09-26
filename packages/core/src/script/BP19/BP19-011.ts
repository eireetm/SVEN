// BP19-011 Leafshade Assassin — Forestcraft follower, 2, 2/3. 八獄・エルフ族.
// Whenever a Condemned follower on your field evolves, select an enemy follower on the field. Combo (3) - Deal it 3 damage.
// {[fanfare]} The next Condemned card you play this turn costs 1 less to play.
import { defineCard, fanfare } from "../helpers";
import { condemned } from "./shared";
import { assassinStrike } from "./shared-forest";

export default defineCard({
  nextPlay: { condemned: (g, card) => condemned(g, card) },
  abilities: [
    assassinStrike,
    fanfare({
      *resolve(fx) {
        yield* fx.nextPlayCostsLess("condemned", 1);
      },
    }),
  ],
});
