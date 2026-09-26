// BP11-072 Hazhan, Demonblade Knight — Abysscraft follower, 3, 1/2. 魔界.
// {[evolve]} {[cost03]}: Evolve this follower.
// {[evolve]} {[cost01]}: Evolve this follower. Activate only if Sanguine is active for you.
// Assail. Bane. Drain.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["assail", "bane", "drain"],
  abilities: [evolveAbility(3), evolveAbility(1, { condition: (g, p) => g.sanguine(p) })],
});
