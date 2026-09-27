// CP01-081 Take a Jab! — Neutral amulet, 2. トレセン学園.
// At the start of your main phase, roll a 6-sided die. If you roll a 1, deal 5 damage to your leader. If you roll a 2, 3, 4, or
// 5, draw a card. If you roll a 6, give your leader {[defense]}+3 and destroy this card. (Destroyed only on a 6 — ruling;
// CR 5.20.)
import { atStartOfYourMainPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourMainPhase({
      *resolve(fx) {
        const roll = yield* fx.rollDie();
        if (roll === 1) yield* fx.dealDamage(fx.game.leader(fx.controller), 5);
        else if (roll <= 5) yield* fx.draw(1);
        else {
          yield* fx.giveLeaderDefense(fx.controller, 3);
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.destroy([fx.self]);
        }
      },
    }),
  ],
});
