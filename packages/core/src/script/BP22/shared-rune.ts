// Shared pieces of BP22 Runecraft card scripts (not a card: the file name has no set prefix).
import { whenCardPutIntoYourBanishedZone } from "../helpers";
import { enemyFollower } from "../targets";

/**
 * BP22-037 / 038 "自分のターン中、自分の消滅領域にカードが置かれたとき、相手の場のフォロワー1体を選ぶ。それに1ダメージ。": once per card
 * (two at once trigger twice), tokens and cards banished as a cost too, and this card itself banished from the field (rulings).
 */
export const chronoWitchPing = whenCardPutIntoYourBanishedZone(
  {
    targets: [enemyFollower()],
    *resolve(fx) {
      yield* fx.dealDamage(fx.targets[0]![0]!, 1);
    },
  },
  { onlyYourTurn: true },
);
