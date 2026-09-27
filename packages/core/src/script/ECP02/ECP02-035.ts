// ECP02-035 Kanade Hayami [Faraway Reflection] — Runecraft follower, 2, 2/3. デレマス・クール.
// {[fanfare]}, Lesson (1): Search your deck for a follower with "Shiki Ichinose", "Syuko Shiomi", "Frederica Miyamoto", or "Mika
// Jougasaki" in its name, reveal it, add it to your hand, then shuffle. (This printing's English misspells "Miyamoto".)
import { lesson } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { followerNamed } from "./shared";

const named4 = followerNamed("Shiki Ichinose", "Syuko Shiomi", "Frederica Miyamoto", "Mika Jougasaki");

export default defineCard({
  abilities: [
    fanfare({
      cost: lesson(1),
      *resolve(fx) {
        yield* fx.search((id) => named4(fx.game, id));
      },
    }),
  ],
});
