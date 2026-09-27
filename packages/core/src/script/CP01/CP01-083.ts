// CP01-083 Sasami Anshinzawa — Neutral follower, 2, 2/2. トレセン学園.
// {[fanfare]} Reveal the top card of your deck. If it costs an odd number of play points, deal 2 damage to each enemy leader. If it
// costs an even number of play points, deal 2 damage to your leader. (0 is even; the card stays on top — rulings.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const [top] = fx.topCards(1);
        if (top === undefined) return;
        yield* fx.reveal([top]);
        const cost = fx.game.info(top).cost ?? 0;
        if (cost % 2 === 1) yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 2);
        else yield* fx.dealDamage(fx.game.leader(fx.controller), 2);
      },
    }),
  ],
});
