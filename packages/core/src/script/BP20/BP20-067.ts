// BP20-067 Nation of Disdain — Dragoncraft amulet, 1. 絶傑・竜族.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a card with Omen and Wyrmkin traits from among them and add
// it to your hand. Put the rest on the bottom of your deck in any order. (Other traits too — ruling.)
// Activate {[engage]} this, bury this: Select a follower on your field and deal it 1 damage.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { yourFollower } from "../targets";
import { omenWyrmkin } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: omenWyrmkin, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [yourFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
