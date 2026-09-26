// BP10-058 Lævateinn Dragon, Dual Form β — Dragoncraft advanced follower, 6, 6/6. 竜族・武装.
// Ward.
// {[fanfare]} Deal 2 damage to each enemy follower on the field. Give your leader {[defense]}+4.
// {[act]} {[cost01]}, bury a Draconic Weapon: Draw a card. You may summon an Armed follower that costs
// 3 or less from your hand. Activate only once per turn. (A Draconic Weapon on your field, CR 10.4.3.
// 元のコスト.)
import { buryFromYourField } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { and, costAtMost, isFollower, named } from "../targets";
import { armed } from "./shared";

const cheapArmedFollower = and(isFollower, armed, costAtMost(3));

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
    activated(
      { playPoints: 1, custom: buryFromYourField(named("Draconic Weapon")) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.draw(1);
          const armedInHand = fx.game.cards(fx.controller, "hand").filter((id) => cheapArmedFollower(fx.game, id));
          yield* fx.putOntoField(yield* fx.chooseCards(armedInHand, 0, 1));
        },
      },
    ),
  ],
});
