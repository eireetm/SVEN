// BP01-171 Goblin — Neutral follower, cost 1, 2/2.
// Text: "{[evolve]}{[cost04]}: Evolve this follower."
// Evolve ability, CR 12.2. Evolves into BP01-172 Goblin (Evolved), 4/4, no text.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(4)],
});
