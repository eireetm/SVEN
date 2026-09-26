// BP15-066 Adherent of Ardor — Dragoncraft follower, 3, 3/3. 絶傑・竜族.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select up to 2 followers on your field and, if Overflow is active for you, deal them 1 damage.
// During your turn, whenever this takes ability damage, select an enemy follower on the field and deal it 3 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";
import { whenTakesAbilityDamageOnYourTurn } from "./shared-dragon";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [yourFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.dealDamageEach(fx.targets[0] ?? [], 1);
      },
    }),
    whenTakesAbilityDamageOnYourTurn({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
