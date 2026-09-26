// BP12-095 Smilecure Priest — Havencraft follower, 3, 2/4. 信仰・獣.
// This card can't be played from the EX area.
// ----------
// Ward.
// {[fanfare]} Give your leader {[defense]}+2.
// {[act]} {[cost01]}, banish this card from your EX area: Give your leader {[defense]}+1. Draw a card.
// (Valid in the EX area — ruling, CR 10.3.5.)
// {[lastwords]} Put this card into its owner's EX area.
import { activated, defineCard, fanfare, lastWords } from "../helpers";
import { banishThisFromEx } from "../costs";

export default defineCard({
  keywords: ["ward"],
  playableIf: (g, self) => g.playZone(self) !== "ex",
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
    activated(
      { playPoints: 1, custom: banishThisFromEx },
      {
        validIn: ["ex"],
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
          yield* fx.draw(1);
        },
      },
    ),
    lastWords({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
