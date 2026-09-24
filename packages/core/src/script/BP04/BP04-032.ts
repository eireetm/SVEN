// BP04-032 Princess Juliet — Swordcraft follower, 3, 3/2. 指揮官・プリンセス.
// If there is a Lord General Romeo on your field, this card costs 2 less to play (2 less even
// with two of them — ruling).
// Storm.
// At the start of your end phase, if there is a Lord General Romeo on your field, select an enemy
// follower on the field and deal it 2 damage.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { enemyFollower, named } from "../targets";

const romeo = (g: GameReader, p: PlayerId) => g.followers(p).some((id) => named("Lord General Romeo")(g, id));

export default defineCard({
  keywords: ["storm"],
  playCost: (g, _self, p) => (romeo(g, p) ? -2 : 0),
  abilities: [
    atStartOfYourEndPhase({
      condition: romeo,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
