// ECP02-003 Hajime Fujiwara [Pink Blossom Dream] — Forestcraft follower, 2, 2/2. デレマス・クール.
// {[fanfare]} Look at the top card of your deck. If it's a Cool card, you may reveal it and add it to your hand. (Not taken, it
// stays on top, unrevealed — ruling.)
// Activate, {[cost00]}: Select an enemy follower on the field and deal it 1 damage. Activate only if there are at least 3 Cool
// followers on your field, and only once per turn.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { cool, followersOnYourField, mayTakeTopCard } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* mayTakeTopCard(fx, cool);
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        condition: (g, c) => followersOnYourField(g, c, cool) >= 3,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
