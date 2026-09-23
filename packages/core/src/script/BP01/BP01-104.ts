// BP01-104 Medusa — Abysscraft follower, 6, 6/6.
// If Sanguine is active for you, this card costs 1 less to play. // Necrocharge (10): This card
// costs 1 less to play. (Both: 2 less — ruling.) // Bane.
// {[act]}{[engage]}: Select an enemy follower on the field and destroy it.
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["bane"],
  playCost: (g, _self, c) => (g.sanguine(c) ? -1 : 0) + (g.necrocharge(c, 10) ? -1 : 0),
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
  ],
});
