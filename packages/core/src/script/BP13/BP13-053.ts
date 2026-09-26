// BP13-053 Sacrifice — Runecraft spell, 2. チェス.
// This card costs 1 less to play if there are at least 5 Chess cards in your cemetery.
// ----------
// Select a Chess follower on your field. Destroy it, search your deck for an X-cost Chess follower, summon
// it, then shuffle. X equals the selected follower's cost plus 2. (元のコスト.)
import { defineCard, spell } from "../helpers";
import { and, hasTrait, isFollower, yourFollower } from "../targets";
import { countIn } from "./shared";

const chess = hasTrait("チェス");

export default defineCard({
  playCost: (g, _self, p) => (countIn(g, p, "cemetery", chess) >= 5 ? -1 : 0),
  abilities: [
    spell({
      targets: [yourFollower({ filter: chess })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const x = (fx.game.info(target).cost ?? 0) + 2;
        yield* fx.destroy([target]);
        yield* fx.search((id) => and(isFollower, chess)(fx.game, id) && fx.game.info(id).cost === x, { to: "field" });
      },
    }),
  ],
});
