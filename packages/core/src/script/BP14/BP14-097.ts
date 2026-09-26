// BP14-097 Boomerang Sister — Havencraft follower, 3, 4/3. 信仰.
// {[fanfare]} Banish a card from your EX area: Select an enemy follower on the field and put it into its owner's
// EX area.
// {[act]} {[cost02]}, banish a card from your EX area: Select an enemy follower on the field and put it into its
// owner's EX area.
// (It loses its damage and given abilities; with a full EX area it stays; a token or an advanced card stays in
// the EX area — rulings, CR 4.8.3.2, 9.1.4, 9.2.2.)
import { banishFromYourEx } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

const banishExCard = banishFromYourEx(() => true, 1);

export default defineCard({
  abilities: [
    fanfare({
      cost: banishExCard,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.putIntoEx(fx.targets[0]!);
      },
    }),
    activated(
      { playPoints: 2, custom: banishExCard },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.putIntoEx(fx.targets[0]!);
        },
      },
    ),
  ],
});
