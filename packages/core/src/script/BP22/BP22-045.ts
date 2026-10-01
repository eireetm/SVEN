// BP22-045 界門のホムンクルス・ラズリ — Runecraft follower, 2, 2/3. 超克.
// ファンファーレ自分のデッキの上2枚を消滅させる。
// 起動コスト2これをアクト：『エンシェントアーティファクト』1体と『レディアントアーティファクト』1体を場に出す。この能力は自分の消滅領域が10枚以上な
// ら使える。
// (Fanfare - Banish the top 2 cards of your deck. Activate {[cost02]}, engage this: summon an Ancient Artifact and a
// レディアントアーティファクト (BP22-T03) token — with room for one, you choose which (ruling); only with at least 10 cards in your
// banished zone.)
import { activated, defineCard, fanfare } from "../helpers";
import { ANCIENT_ARTIFACT, RADIANT_ARTIFACT } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.banish(fx.topCards(2));
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true },
      {
        condition: (g, c) => g.cards(c, "banished").length >= 10,
        *resolve(fx) {
          yield* fx.summon([ANCIENT_ARTIFACT, RADIANT_ARTIFACT]);
        },
      },
    ),
  ],
});
