// ECP02-005 Yuki Himekawa [Full Swing☆Cheer] — Forestcraft follower, 7, 4/4. デレマス・パッション.
// Storm.
// {[fanfare]} Deal 4 damage to each enemy follower on the field. If the total cost of Passion cards on your field is 10 or more,
// deal 8 damage instead. If 20 or more, deal 4 damage to each enemy leader. (元のコスト; this card counts.)
import { defineCard, fanfare } from "../helpers";
import { damageEnemyLeader, passion } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const total = g.cards(fx.controller, "field").reduce((sum, id) => sum + (passion(g, id) ? (g.info(id).cost ?? 0) : 0), 0);
        yield* fx.dealDamageEach(g.followers(g.opponent(fx.controller)), total >= 10 ? 8 : 4);
        if (total >= 20) yield* damageEnemyLeader(fx, 4);
      },
    }),
  ],
});
