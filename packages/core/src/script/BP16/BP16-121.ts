// BP16-121 Doomwright Resurgence — Neutral spell, 2. 超克・光輝.
// Select a Supreme token follower on your field that costs 5 or less and summon a token of the same name. (元のコスト.)
import { defineCard, spell } from "../helpers";
import { costAtMost, isToken, yourFollower } from "../targets";
import { supreme } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: (g, id) => isToken(g, id) && supreme(g, id) && costAtMost(5)(g, id) })],
      *resolve(fx) {
        yield* fx.summon([fx.game.info(fx.targets[0]![0]!).name]);
      },
    }),
  ],
});
