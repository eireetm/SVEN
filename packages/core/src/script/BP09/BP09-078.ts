// BP09-078 Raven, Eventide Vampire — Abysscraft follower, 2, 1/1. 吸血鬼.
// {[act]} {[engage]}, bury a Forest Bat: Choose one of the following. (1) Select an enemy follower on the
// field. Deal it 4 damage and draw a card. (2) Deal 2 damage to each enemy leader. Give your leader
// {[defense]}+2. Draw a card. (A Forest Bat on your field, CR 10.4.3.)
import { buryFromYourField } from "../costs";
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { forestBat } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, custom: buryFromYourField(forestBat) },
      {
        modes: [
          {
            id: "follower",
            label: "(1) Deal 4 damage to an enemy follower and draw a card",
            targets: [enemyFollower()],
            *resolve(fx) {
              yield* fx.dealDamage(fx.targets[0]![0]!, 4);
              yield* fx.draw(1);
            },
          },
          {
            id: "leader",
            label: "(2) Deal 2 damage to each enemy leader, give your leader +2 defense and draw a card",
            *resolve(fx) {
              yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 2);
              yield* fx.giveLeaderDefense(fx.controller, 2);
              yield* fx.draw(1);
            },
          },
        ],
      },
    ),
  ],
});
