// BP22-049 暗獄の遣い・ジャスパー — Runecraft follower, 3, 1/5. 超克.
// 自分の場にゴーレム・フォロワーが出たとき、相手の場のフォロワー1体を選ぶ。それに2ダメージ。それのリーダーに1ダメージ。
// ファンファーレ『攻撃型ゴーレム』1枚をEXエリアに置く。
// 起動コスト3：このターン、自分がEXエリアのゴーレム・カードをプレイする際、コストを-3する。
// (Whenever a Golem follower is put onto your field — during the opponent's turn too — select an enemy follower on the field, deal
// it 2 damage and 1 to its leader; nothing without a follower to select (rulings). Fanfare - Put a Strikeform Golem token into your
// EX area. Activate {[cost03]}: for the rest of this turn, Golem cards you play from your EX area cost 3 less — every one, even
// after this leaves the field; twice: 6 less (rulings).)
import { activated, defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower } from "../targets";
import { golem, STRIKEFORM_GOLEM } from "./shared";

export default defineCard({
  nextPlay: { exGolem: (g, card) => g.playZone(card) === "ex" && golem(g, card) },
  abilities: [
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const leader = fx.game.leader(fx.game.controller(target));
          yield* fx.dealDamage(target, 2);
          yield* fx.dealDamage(leader, 1);
        },
      },
      { filter: golem },
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([STRIKEFORM_GOLEM]);
      },
    }),
    activated(
      { playPoints: 3 },
      {
        *resolve(fx) {
          yield* fx.cardsCostLessThisTurn("exGolem", 3);
        },
      },
    ),
  ],
});
