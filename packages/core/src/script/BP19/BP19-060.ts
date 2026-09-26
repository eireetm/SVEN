// BP19-060 Scorched-Earth Tyrant — Dragoncraft follower, 4, 4/4. 八獄・ドラゴニュート.
// This can't be played from the EX area.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Bury a Condemned card in your EX area: Select an enemy follower on the field and deal it 4 damage. (The target is
// selected first, CR 10.6.2.3; CR 10.4.7.4.)
// {[lastwords]} Put this into its owner's EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { backToEx, buryCondemnedFromEx, notFromEx } from "./shared-dragon";

export default defineCard({
  playableIf: notFromEx,
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: buryCondemnedFromEx(1),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    backToEx,
  ],
});
