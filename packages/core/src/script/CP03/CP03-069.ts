// CP03-069 Vortex Dragon — Dragoncraft follower, 5, 6/6. ヴァンガード・かげろう.
// {[fanfare]} Banish 3 Kagero cards from your cemetery: Select up to 2 enemy followers on the field and destroy them.
import { banishFromYour } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { kagero } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYour(["cemetery"], kagero, 3),
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
  ],
});
