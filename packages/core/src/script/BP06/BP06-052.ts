// BP06-052 Golem's Rampage — Runecraft spell, 2. ゴーレム・禁忌.
// Bury a Golem follower: Deal 3 damage to each enemy leader and enemy follower on the field. (A
// Golem follower on your field; optional, done while it resolves, CR 10.4.7.5.)
import { defineCard, spell } from "../helpers";
import { buryFromYourField } from "../costs";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        if (!(yield* fx.optionalCost(buryFromYourField(and(isFollower, hasTrait("ゴーレム")))))) return;
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], 3);
      },
    }),
  ],
});
