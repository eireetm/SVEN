// BP15-067 Adherent of Ardor (Evolved) — Dragoncraft follower, 4/4. 絶傑・竜族.
// On Evolve - Select up to 2 followers on your field and deal them 1 damage.
// During your turn, whenever this takes ability damage, select an enemy follower on the field and deal it 3 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";
import { whenTakesAbilityDamageOnYourTurn } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [yourFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.targets[0] ?? [], 1);
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
