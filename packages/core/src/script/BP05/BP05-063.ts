// BP05-063 Servant of Disdain — Dragoncraft follower, 2, 2/3. 絶傑・竜族.
// {[fanfare]} If Overflow is active for you, select another follower on the field. Deal 1 damage to
// it and this follower. (Either side; no other follower: nothing happens — rulings.)
// During your turn, whenever this follower takes ability damage, draw a card. (Also when the
// damage destroys it — ruling.)
import { defineCard, fanfare } from "../helpers";
import { anotherFollower } from "../targets";
import { whenTakesAbilityDamageOnYourTurn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherFollower({ when: (g, c) => g.overflow(c) })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamageEach([target, fx.self], 1);
      },
    }),
    whenTakesAbilityDamageOnYourTurn(function* (fx) {
      yield* fx.draw(1);
    }),
  ],
});
