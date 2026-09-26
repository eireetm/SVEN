// BP21-037 Amaryllis, the Princess — Runecraft follower, 1, 0/3. 魔法使い・学院・プリンセス.
// At the start of your end phase, you may bury the top card of your deck. (Without looking at it — ruling.)
// Once per turn, when this takes ability damage, give this {[attack]}+2. (CR 10.7.2.2; ability damage, CR 5.14.3 — ruling.)
// {[fanfare]} If there are at least 10 Academic cards in your cemetery, put a Curse of Suffering token into your EX area.
import { atStartOfYourEndPhase, defineCard, fanfare, whenThisTakesDamage } from "../helpers";
import { academicsInCemetery } from "./shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (fx.topCards(1).length > 0 && (yield* fx.confirm())) yield* fx.mill(1);
      },
    }),
    {
      ...whenThisTakesDamage(
        {
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 0);
          },
        },
        { ability: true },
      ),
      timesPerTurn: 1,
    },
    fanfare({
      *resolve(fx) {
        if (academicsInCemetery(fx.game, fx.controller) >= 10) yield* fx.tokensToEx(["Curse of Suffering"]);
      },
    }),
  ],
});
