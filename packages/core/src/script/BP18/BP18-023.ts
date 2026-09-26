// BP18-023 Gawain, Oath to Glory — Swordcraft follower, 2, 3/3. 兵士・円卓.
// Rush.
// {[fanfare]} If there are at least 5 {[swordcraft]} followers in your cemetery, draw a card. If there are at least 10, give
// this Storm and your leader {[defense]}+2. If there are at least 15, give this Intimidate and Aura. If there are at least
// 20, give this {[attack]}+7/{[defense]}+7. (Each threshold covers its whole sentence — Q10, as in English.)
import { defineCard, fanfare } from "../helpers";
import { and, isClass, isFollower } from "../targets";

const swordFollower = and(isFollower, isClass("Swordcraft"));

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const n = fx.game.cards(fx.controller, "cemetery").filter((id) => swordFollower(fx.game, id)).length;
        const here = () => fx.game.card(fx.self)?.zone === "field";
        if (n >= 5) yield* fx.draw(1);
        if (n >= 10) {
          if (here()) yield* fx.giveKeyword(fx.self, "storm");
          yield* fx.giveLeaderDefense(fx.controller, 2);
        }
        if (n >= 15 && here()) {
          yield* fx.giveKeyword(fx.self, "intimidate");
          yield* fx.giveKeyword(fx.self, "aura");
        }
        if (n >= 20 && here()) yield* fx.giveStats(fx.self, 7, 7);
      },
    }),
  ],
});
