// ECP02-040 Akari Tsujino [Twice as Lovely] — Dragoncraft follower, 3, 3/3. デレマス・キュート.
// Rush.
// {[fanfare]} Bury the top 3 cards of your deck. If you buried a Cute card, give your leader {[defense]}+2. If you buried a Cool
// card, give this Assail. If you buried a Passion card, give this {[attack]}+2. (A card with all three types meets each; each
// applies once however many — rulings.)
import { defineCard, fanfare } from "../helpers";
import { cool, cute, passion } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const buried = yield* fx.mill(3);
        const onField = () => g.card(fx.self)?.zone === "field";
        if (buried.some((id) => cute(g, id))) yield* fx.giveLeaderDefense(fx.controller, 2);
        if (buried.some((id) => cool(g, id)) && onField()) yield* fx.giveKeyword(fx.self, "assail");
        if (buried.some((id) => passion(g, id)) && onField()) yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
  ],
});
