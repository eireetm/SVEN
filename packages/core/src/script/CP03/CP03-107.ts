// CP03-107 CEO Amaterasu (Evolved) — 6/6.
// Assail. Twin Drive.
// Whenever you drive check a Trigger, choose one. (1) Select an enemy follower on the field and banish it. (2) Draw a card.
// (Without an enemy follower (1) can't be chosen; only a resolved Trigger triggers it, twice for Twin Drive — rulings.)
import { defineCard, whenYouDriveCheckTrigger } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["assail", "twinDrive"],
  abilities: [
    whenYouDriveCheckTrigger({
      modes: [
        {
          id: "1",
          label: "Banish an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.banish(fx.targets[0]!);
          },
        },
        {
          id: "2",
          label: "Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
