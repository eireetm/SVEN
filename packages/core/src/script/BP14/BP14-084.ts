// BP14-084 Parkour Werewolf — Abysscraft follower, 4, 4/4. 魔界・獣.
// This doesn't take ability damage. (All damage except combat damage and attack damage to a leader — ruling,
// CR 5.14.3.3.)
// Strike - Deal 2 damage to each enemy leader. Give your leader {[defense]}+2.
// {[act]} {[cost02]}: Give this Storm.
import { activated, defineCard, strike } from "../helpers";

export default defineCard({
  field: { damageTaken: (_g, _self, d) => (d.kind === "ability" ? -d.amount : 0) },
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
    activated(
      { playPoints: 2 },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});
