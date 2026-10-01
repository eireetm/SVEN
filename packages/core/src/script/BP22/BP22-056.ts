// BP22-056 イグニスドラゴン — Dragoncraft follower, 7, 4/6. 竜族.
// これを自分の手札から捨てたとき、コスト2：自分のPP最大値を+1する。
// 進化コスト1：これは進化する。
// ファンファーレ自分の手札が3枚以下なら、これは進化する。
// (When this is discarded from your hand, {[cost02]}: +1 max play points — during the opponent's turn too, and when discarded for
// the hand limit (rulings; an optional cost, CR 10.4.7.4). Evolve (1). Fanfare - If you have 3 or fewer cards in your hand, evolve
// this — counted when it resolves, after this left the hand (ruling); an effect's evolution (ruling).)
import { playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare, whenDiscarded } from "../helpers";

export default defineCard({
  abilities: [
    whenDiscarded({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
      },
    }),
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "hand").length <= 3 && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
