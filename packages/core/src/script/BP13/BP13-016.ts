// BP13-016 Gazania Fox — Forestcraft follower, 2, 2/2. 精霊・植物族・獣.
// This card costs 1 less to play if a Beast follower not named Gazania Fox was returned to hand from your
// field this turn. (As it was on the field, like BP10-009.)
// ----------
// {[fanfare]} Select an enemy follower on the field and deal it 1 damage. If there's a Beast follower that
// costs 5 or more on your field, deal it 4 damage instead and give this follower Aura. (Aura only with
// the 4 damage, as the English says; not played without a target — ruling.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtLeast, enemyFollower } from "../targets";
import { beast } from "./shared";

export default defineCard({
  playCost: (g, _self, p) =>
    g.cardsReturnedToHandThisTurn(p).some((r) => r.type === "follower" && r.traits.includes("獣") && !r.names.includes("Gazania Fox"))
      ? -1
      : 0,
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const big = fx.game.followers(fx.controller).some((id) => and(beast, costAtLeast(5))(fx.game, id));
        yield* fx.dealDamage(fx.targets[0]![0]!, big ? 4 : 1);
        if (big && fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "aura");
      },
    }),
  ],
});
