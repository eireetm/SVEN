// BP04-028 Shrouded Assassin — Swordcraft follower, 2, 1/2. 暗殺者.
// {[evolve]} {[cost02]}: Evolve this follower. Bane.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["bane"], abilities: [evolveAbility(2)] });
