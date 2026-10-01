// BP22-077 ケルヌンノス — Abysscraft follower, 2, 2/3. 魔界.
// ファンファーレ手札の元のコスト2のカード1枚を捨てる：1枚引く。
// 起動コスト4これをアクト：自分の墓場の「これと同名を除く元のコスト2のナイトメアフォロワー」をカード名が異なるように2枚まで選ぶ。それを場に出す。
// この能力は自分の墓場の元のコスト2のカードが10枚以上なら使える。
// (Fanfare - Discard a card that costs 2 (元のコスト): draw a card. Activate {[cost04]}, engage this: select up to 2 Abysscraft
// followers that cost 2, not named ケルヌンノス, with different names, in your cemetery and put them onto your field; only with at
// least 10 cards that cost 2 in your cemetery.)
import { discardA } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { inYourZone, isClass, isFollower, named } from "../targets";
import { cost2InCemetery, costOf, KERNUNNOS } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA((g, id) => costOf(g, id) === 2),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { playPoints: 4, engageSelf: true },
      {
        condition: (g, c) => cost2InCemetery(g, c) >= 10,
        targets: [
          inYourZone("cemetery", {
            count: 2,
            upTo: true,
            distinctNames: true,
            filter: (g, id) => isFollower(g, id) && isClass("Abysscraft")(g, id) && costOf(g, id) === 2 && !named(KERNUNNOS)(g, id),
          }),
        ],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets[0] ?? []);
        },
      },
    ),
  ],
});
