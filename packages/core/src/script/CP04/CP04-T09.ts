// CP04-T09 Precious Memento — Dragoncraft equipment token, 2. プリコネ.
// The equipped follower has Storm and "Strike - Select up to 2 enemy followers on the field and deal them 3 damage." (Its own
// abilities: lost with its abilities; two Mementos, two Strikes — rulings.)
// (Place this beneath the equipped follower.)
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  equipment: {
    keywords: ["storm"],
    abilities: [
      strike({
        targets: [enemyFollower({ count: 2, upTo: true })],
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.targets[0]!, 3);
        },
      }),
    ],
  },
});
