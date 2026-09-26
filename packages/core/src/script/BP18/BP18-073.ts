// BP18-073 Serpent Drake — Dragoncraft follower, 4, 4/3. 竜族.
// Rush.
// {[fanfare]} If Overflow is active for you, give this {[attack]}+2/{[defense]}+2.
// Whenever this takes damage, if it's on your field, search your deck for a Serpent Drake, summon it, then shuffle. (Checked
// as it resolves: not after lethal damage; on the opponent's turn too — rulings.)
import { defineCard, fanfare, whenThisTakesDamage } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller) && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
    whenThisTakesDamage({
      condition: (g, c, self) => g.card(self)?.zone === "field" && g.controller(self) === c,
      *resolve(fx) {
        yield* fx.search((id) => named("Serpent Drake")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
