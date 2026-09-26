// BP14-066 Dragon-Drawn Carriage — Dragoncraft follower, 2, 2/3. 宴楽・竜族.
// {[fanfare]} Look at the top 4 cards of your deck. You may reveal a Festive card from among them and put it on
// the top of your deck. Put the rest on the bottom in any order.
// Activate Remove 2 divine water counters from a Soothing Dragonspring on your field: Give this {[attack]}+1
// and Storm. Activate only once per turn. (Not without the counters — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { festive, removeDivineWater } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(4);
        yield* fx.lookAt(top);
        const [kept] = yield* fx.selectCards(
          top.filter((id) => festive(fx.game, id)),
          0,
          1,
          fx.controller,
          top,
        );
        if (kept !== undefined) yield* fx.reveal([kept]);
        // With the others at the bottom, the kept card is the top card.
        yield* fx.bottomInAnyOrder(top.filter((id) => id !== kept && fx.game.card(id)?.zone === "deck"));
      },
    }),
    activated(
      { custom: removeDivineWater },
      {
        oncePerTurn: true,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "field") return;
          yield* fx.giveStats(fx.self, 1, 0);
          yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});
