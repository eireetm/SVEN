// BP22-012 水晶の指揮者・リリィ — Forestcraft follower, 1, 1/1. クリスタリア.
// 起動これをアクト：自分の場の他のクリスタリア・フォロワー1体を選ぶ。それは【疾走】を持つ。この能力は自分の墓場のクリスタリア・カードが3枚
// 以上なら使える。
// (Activate, engage this: select another Crystalia follower on your field; it gains Storm. Only with at least 3 Crystalia cards
// in your cemetery.)
import { activated, defineCard } from "../helpers";
import { anotherYourFollower } from "../targets";
import { crystalia } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => g.cards(c, "cemetery").filter((id) => crystalia(g, id)).length >= 3,
        targets: [anotherYourFollower({ filter: crystalia })],
        *resolve(fx) {
          yield* fx.giveKeyword(fx.targets[0]![0]!, "storm");
        },
      },
    ),
  ],
});
