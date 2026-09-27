// CP04-060 Kaya (Evolved) — Dragoncraft, 5/5. プリコネ・ドラゴンズネスト.
// {[ub]} On Evolve - Search your deck for a Dragon's Nest card not named Kaya, put it into your EX area, then shuffle. It costs 2
// less to play this turn.
// Storm.
// Whenever a {[ub]} ability of another follower on your field is executed, deal 2 damage to each enemy leader.
import { defineCard, onEvolve, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { named } from "../targets";
import { cheaperThisTurn, damageEnemyLeader, dragonsNest } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    ub(
      onEvolve({
        *resolve(fx) {
          const found = yield* fx.search((id) => dragonsNest(fx.game, id) && !named("Kaya")(fx.game, id), { to: "ex" });
          yield* cheaperThisTurn(fx, found, 2);
        },
      }),
    ),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 2);
      },
    }),
  ],
});
