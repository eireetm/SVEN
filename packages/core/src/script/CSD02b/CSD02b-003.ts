// CSD02b-003 Karen Hojo [Song for Life] — Swordcraft follower, 1, 3/2. デレマス・クール.
// At the start of your end phase, if there are no other Cool followers on your field, deal 1 damage to this follower. (Checked when
// it resolves — open-questions Q6.)
// {[act]} {[cost03]}, Lesson (1): Give each follower on your field {[attack]}+1.
import { lesson } from "../costs";
import { activated, atStartOfYourEndPhase, defineCard } from "../helpers";
import { cool, followerThat } from "../CP02/shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        const coolFollower = followerThat(cool);
        if (fx.game.followers(fx.controller).some((id) => id !== fx.self && coolFollower(fx.game, id))) return;
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.dealDamage(fx.self, 1);
      },
    }),
    activated(
      { playPoints: 3, custom: lesson(1) },
      {
        *resolve(fx) {
          for (const id of fx.game.followers(fx.controller)) yield* fx.giveStats(id, 1, 0);
        },
      },
    ),
  ],
});
