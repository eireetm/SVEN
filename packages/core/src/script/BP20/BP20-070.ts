// BP20-070 Devotee of Disdain — Dragoncraft follower, 2, 2/3. 絶傑・竜族.
// {[act]} {[cost00]}: Select a follower on your field and deal it 1 damage. Activate only once per turn.
import { activated, defineCard } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        targets: [yourFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
