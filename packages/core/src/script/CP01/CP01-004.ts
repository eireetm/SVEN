// CP01-004 Gold City — Forestcraft follower, 4, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Recover 3 play points.
// While there are at least 8 cards on the field, this follower has Storm. (Both fields; only on the field — rulings. An
// attack declared while it had Storm goes on if it loses it — ruling.)
import { defineCard, fanfare, serveAbility } from "../helpers";

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => (card === self && g.cards(0, "field").length + g.cards(1, "field").length >= 8 ? ["storm"] : []),
  },
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
