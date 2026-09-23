// BP01-144 Mainyu — Havencraft follower, 2, 2/2.
// {[evolve]}{[cost01]}: Evolve this follower. // Aura.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["aura"], abilities: [evolveAbility(1)] });
