// PCS01-049 Princess Knight (Evolved) — 3/3.
// Japanese-only text (no English text); implemented from the Japanese:
// これが場にいる限り、自分の場の他のプリコネ・フォロワーすべては【守護】を持つ。
//   (While this is on the field, each other PriConne follower on your field has Ward.)
// 【進化時】自分の場の他のプリコネ・フォロワー1体を選ぶ。それは攻撃力+10/体力+10する。
//   (On Evolve - Select another PriConne follower on your field. Give it +10/+10.)
import { defineCard, onEvolve } from "../helpers";
import { anotherYourFollower } from "../targets";
import { priconne } from "../CP04/shared";
import { priconneHaveWard } from "./shared";

export default defineCard({
  field: { keywordsFor: priconneHaveWard },
  abilities: [
    onEvolve({
      targets: [anotherYourFollower({ filter: priconne })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 10, 10);
      },
    }),
  ],
});
