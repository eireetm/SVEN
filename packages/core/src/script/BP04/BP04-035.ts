// BP04-035 Tristan of the Round Table — Swordcraft follower, 2, 2/2. 兵士・円卓.
// {[evolve]} {[cost01]}: Evolve this follower. Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(1)] });
