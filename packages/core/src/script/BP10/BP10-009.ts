// BP10-009 Salvia Panther — Forestcraft follower, 3, 3/2. 植物族・獣.
// This card costs 2 less to play if a Beast follower not named Salvia Panther was returned to hand
// from your field this turn. (As it was on the field, CR 10.7.4.1.)
// ----------
// {[evolve]} {[cost02]}: Evolve this follower.
// Storm.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  playCost: (g, _self, p) =>
    g.cardsReturnedToHandThisTurn(p).some((r) => r.type === "follower" && r.traits.includes("獣") && !r.names.includes("Salvia Panther"))
      ? -2
      : 0,
  keywords: ["storm"],
  abilities: [evolveAbility(2)],
});
