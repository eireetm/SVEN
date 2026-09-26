// BP10-001 XII. Wolfraud, Hanged Man — Forestcraft follower, 2, 2/2. アルカナ・精霊.
// {[evolve]} {[cost01]}: Evolve this follower.
// This card can't be destroyed by abilities or take ability damage. (Being put into the cemetery is
// not destruction — ruling.)
// {[fanfare]} {[cost05]} Search your deck for a Treacherous Reversal, put it into your EX area, then
// shuffle. It costs 8 less to play this turn.
import { playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  cannotBeDestroyedByAbilities: true,
  // Ability damage is everything but combat damage and attack damage to a leader (ruling, CR 5.14.3).
  field: { damageTaken: (_g, _self, damage) => (damage.kind === "ability" ? -damage.amount : 0) },
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: playPointsCost(5),
      *resolve(fx) {
        const found = yield* fx.search((id) => named("Treacherous Reversal")(fx.game, id), { to: "ex" });
        for (const card of found) yield* fx.changePlayCost(card, -8, "endOfTurn");
      },
    }),
  ],
});
