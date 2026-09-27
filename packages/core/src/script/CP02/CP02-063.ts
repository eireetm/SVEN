// CP02-063 Tokiko Zaizen — Dragoncraft follower, 3, 4/3. デレマス・パッション.
// {[fanfare]} Deal each enemy leader damage equal to the number of other iM@S CG followers on your field.
import { defineCard, fanfare } from "../helpers";
import { damageEnemyLeader, imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const others = fx.game.followers(fx.controller).filter((id) => id !== fx.self && imas(fx.game, id)).length;
        if (others > 0) yield* damageEnemyLeader(fx, others);
      },
    }),
  ],
});
