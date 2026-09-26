// BP19-081 Genomuel, Wyrm Enforcer — Abysscraft follower, 5, 5/5. 八獄・魔界.
// At the start of your end phase, give each enemy follower on the field {[attack]}-3/{[defense]}-3. Deal 3 damage to each
// enemy leader.
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        for (const id of fx.game.followers(opp)) yield* fx.giveStats(id, -3, -3);
        yield* fx.dealDamage(fx.game.leader(opp), 3);
      },
    }),
  ],
});
