// BP11-024 Tyrant's Order — Swordcraft spell, 1. 荒野・指揮官.
// Select up to 1 Boxed enemy follower on the field. Destroy it, search your deck for a Wasteland
// follower, reveal it, add it to your hand, then shuffle. (Selecting none still searches — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { wastelandFollower } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower({ count: 1, upTo: true, filter: (g, id) => g.isBoxed(id) })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
        yield* fx.search((id) => wastelandFollower(fx.game, id));
      },
    }),
  ],
});
