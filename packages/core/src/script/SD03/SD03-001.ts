// SD03-001 Mythril Golem — Runecraft follower, 6, 5/6. ゴーレム.
// {[fanfare]} Deal 3 damage to each enemy follower on the field. Spellchain (7): Deal 5 damage instead. SC (15): Deal 5 damage to
// each enemy leader. (The leader is damaged also without enemy followers; with SC (15) followers and leaders take 5 each — rulings.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach(fx.game.followers(opp), fx.game.spellchain(fx.controller, 7) ? 5 : 3);
        if (fx.game.spellchain(fx.controller, 15)) yield* fx.dealDamage(fx.game.leader(opp), 5);
      },
    }),
  ],
});
