// BP12-001 Awakened Gaia — Forestcraft follower, 11, 5/5. 自然・植物族.
// This card costs 5 less to play for every 5 Natura cards in your cemetery. (5–9 cards: 5 less, 10–14:
// 10 less, ... — ruling.)
// ----------
// {[fanfare]} Select an enemy follower on the field and destroy it.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, natura } from "./shared";

export default defineCard({
  playCost: (g, _self, controller) => -5 * Math.floor(countIn(g, controller, "cemetery", natura) / 5),
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
