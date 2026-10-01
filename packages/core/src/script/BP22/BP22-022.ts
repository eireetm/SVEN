// BP22-022 千金武装の大参謀・アルメリゼ (evolved) — Swordcraft, 3/3. 指揮官・貴族.
// 【超進化時】これは「自分のEXエリアに『輝く金貨』が置かれたとき、相手のリーダーすべてと相手の場のフォロワーすべてに1ダメージ」を持つ。
// 『輝く金貨』1枚をEXエリアに置く。
// 起動EXエリアの『輝く金貨』2枚を消滅：下記から1つチョイスする。【1】相手の場のフォロワー1体を選ぶ。それに3ダメージ。【2】2枚引く。自分の手札
// 1枚をデッキの下に置く。
// (On Super-Evolve - This gains "Whenever a Glittering Gold is put into your EX area, deal 1 damage to each enemy leader and each
// enemy follower on the field" (a gained text, as BP18-081), then put a Glittering Gold token into your EX area — which triggers
// it (ruling). Activate - Banish 2 Glittering Golds from your EX area: choose one: (1) select an enemy follower on the field and
// deal it 3 damage; (2) draw 2 cards, then put a card from your hand on the bottom of your deck.)
import { banishFromYourEx } from "../costs";
import { activated, defineCard, onSuperEvolve, whenCardPutIntoYourEx } from "../helpers";
import { enemyFollower, named } from "../targets";
import { GLITTERING_GOLD } from "./shared";

const GOLD_DAMAGE = "Whenever a Glittering Gold is put into your EX area, deal 1 damage to each enemy leader and each enemy follower on the field.";

export default defineCard({
  abilities: [
    onSuperEvolve({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.gainText(fx.self, GOLD_DAMAGE);
        yield* fx.tokensToEx([GLITTERING_GOLD]);
      },
    }),
    // The gained text (CR 10.9.1.2): an ability of this card only once it has gained it.
    whenCardPutIntoYourEx(
      {
        triggerIf: (g, _c, self) => g.hasGainedText(self, GOLD_DAMAGE),
        *resolve(fx) {
          const opp = fx.game.opponent(fx.controller);
          yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], 1);
        },
      },
      named(GLITTERING_GOLD),
    ),
    activated(
      { custom: banishFromYourEx(named(GLITTERING_GOLD), 2) },
      {
        modes: [
          {
            id: "damage",
            label: "Deal 3 damage to an enemy follower",
            targets: [enemyFollower()],
            *resolve(fx) {
              yield* fx.dealDamage(fx.targets[0]![0]!, 3);
            },
          },
          {
            id: "draw",
            label: "Draw 2 cards, then put a card from your hand on the bottom of your deck",
            *resolve(fx) {
              yield* fx.draw(2);
              const [card] = yield* fx.chooseCards(fx.game.cards(fx.controller, "hand"), 1, 1);
              if (card !== undefined) yield* fx.putOnDeck([card], "bottom");
            },
          },
        ],
      },
    ),
  ],
});
