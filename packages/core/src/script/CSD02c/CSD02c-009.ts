// CSD02c-009 Miu Yaguchi — Swordcraft follower, 3, 2/4. デレマス・パッション.
// Ward.
// {[fanfare]} Bury the top card of your deck. If it costs an odd number of play points, draw a card. If not, give your leader
// {[defense]}+2. (元のコスト of the card this put into the cemetery; an even cost gives +2 — the Japanese text and ruling. Nothing
// without a card.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const [buried] = yield* fx.mill(1);
        if (buried === undefined) return;
        const cost = fx.game.db.get(fx.game.card(buried)!.def).cost ?? 0;
        if (cost % 2 === 1) yield* fx.draw(1);
        else yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
