// BP18-003 Kyou, Verdant Path Shepherd — Forestcraft follower, 2, 2/2. 透京・植物族.
// Whenever a follower on your field evolves, deal 1 damage to each enemy leader. If it's the 1st time a follower on your
// field has evolved this turn, draw a card. If it's the 2nd, give this Storm. If it's the 3rd, give this
// {[attack]}+2/{[defense]}+2. (Counted from the start of the turn, not from when this came in; super-evolving counts — rulings.)
import { defineCard, whenYourFollowerEvolves } from "../helpers";

export default defineCard({
  abilities: [
    whenYourFollowerEvolves({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        const nth = fx.data?.count ?? 0;
        const here = fx.game.card(fx.self)?.zone === "field";
        if (nth === 1) yield* fx.draw(1);
        else if (nth === 2 && here) yield* fx.giveKeyword(fx.self, "storm");
        else if (nth === 3 && here) yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
