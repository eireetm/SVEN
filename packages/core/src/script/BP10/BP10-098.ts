// BP10-098 Somnolent Strength — Havencraft amulet, 2. アルカナ・先導.
// {[fanfare]} Select up to 2 followers on your field and give them {[attack]}+1/{[defense]}+1.
// {[act]} {[cost01]}, {[engage]}, bury this card: Select an enemy follower on the field and give it
// {[attack]}-2. (Attack can go below 0 — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        for (const id of fx.targets[0]!) yield* fx.giveStats(id, 1, 1);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, -2, 0);
        },
      },
    ),
  ],
});
