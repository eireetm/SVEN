// BP06-032 Petalwink Paladin — Swordcraft follower, 6, 5/5. 指揮官・貴族.
// {[fanfare]} Select an enemy follower on the field. Destroy it and draw a card. (No target: no
// draw either — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
        yield* fx.draw(1);
      },
    }),
  ],
});
