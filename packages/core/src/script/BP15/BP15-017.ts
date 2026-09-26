// BP15-017 Bouquet Fairy — Forestcraft follower, 3, 2/2. 妖精.
// {[fanfare]} Put a Fairy Wisp token into your EX area.
// Activate {[engage]} this, banish a card from your EX area: Select an enemy follower on the field and return it
// to its owner's hand. (Not played, nor its cost paid, without a target — ruling.)
import { banishFromYourEx } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { FAIRY_WISP } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY_WISP]);
      },
    }),
    activated(
      { engageSelf: true, custom: banishFromYourEx(() => true, 1) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
        },
      },
    ),
  ],
});
