// BP04-119 Grimnir, War Cyclone — Neutral follower, 3, 3/4. 光輝.
// {[evolve]} {[cost02]}: Evolve this follower. Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(2)] });
