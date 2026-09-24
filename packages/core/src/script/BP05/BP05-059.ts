// BP05-059 Disciple of Disdain — Dragoncraft follower, 1, 1/2. 絶傑・竜族.
// {[act]} {[cost00]}: Select a follower on your field and deal it 1 damage. This ability can be
// activated once per turn.
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
