// BP04-040 Giant Chimera — Runecraft follower, 7, 7/7. 魔法生物・禁忌.
// {[fanfare]}, Spellchain (10): Deal 5 damage to each enemy leader and enemy follower on the
// field. SC (20): Deal 10 damage instead. SC (30): Deal 30 damage instead.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const sc = fx.game.spellchainCount(fx.controller); // fixed as it starts to resolve (CR 13.3.1.4)
        if (sc < 10) return;
        const n = sc >= 30 ? 30 : sc >= 20 ? 10 : 5;
        const opp = fx.game.opponent(fx.controller);
        yield* fx.dealDamages([
          { target: fx.game.leader(opp), amount: n },
          ...fx.game.followers(opp).map((target) => ({ target, amount: n })),
        ]);
      },
    }),
  ],
});
