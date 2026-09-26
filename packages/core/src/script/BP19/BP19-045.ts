// BP19-045 Warden of the Arcane — Runecraft follower, 5, 2/4. 八獄・魔法使い.
// {[fanfare]} Deal 2 damage to each enemy follower on the field. Look at the top 3 cards of your deck. You may reveal a Mage
// card from among them and add it to your hand. Bury the rest. The next 3-cost or less Mage card you play this turn costs 3
// less to play. (元のコスト.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { mage } from "./shared";

export default defineCard({
  nextPlay: { cheapMage: (g, card) => mage(g, card) && (g.info(card).cost ?? Infinity) <= 3 },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
        yield* lookAtTopCards(fx, 3, { filter: mage, to: "hand", rest: "cemetery" });
        yield* fx.nextPlayCostsLess("cheapMage", 3);
      },
    }),
  ],
});
