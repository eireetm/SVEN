// BP01-174 Goliath — Neutral follower, cost 3, 3/4.
// Text: "{[evolve]}{[cost02]}: Evolve this follower."
// Evolve ability, CR 12.2. Evolves into BP01-175 Goliath (Evolved), 5/6, no text.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(2)],
});
