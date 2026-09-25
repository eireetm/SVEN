// BP09-004 Paula, Icy Warmth — Forestcraft follower, 2, 2/2. 妖精.
// {[evolve]} {[cost01]}: Evolve this follower into a Paula, Gentle Warmth or Paula, Passionate Warmth.
// (Either face of the double-faced BP09-005 — ruling, CR 4.6.4. An effect that evolves it finds no
// evolved card with its own name, CR 5.16.1.1.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(1, { into: ["Paula, Gentle Warmth", "Paula, Passionate Warmth"] })],
});
