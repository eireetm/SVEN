// BP15-037 Brave Buccaneer — Swordcraft follower, 3, 3/3. 兵士・盗賊.
// Rush.
// {[fanfare]} Select up to 2 enemy followers on the field and engage them.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0] ?? []);
      },
    }),
  ],
});
