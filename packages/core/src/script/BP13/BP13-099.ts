// BP13-099 Charitable Al-mi'raj — Havencraft follower, 2, 2/2. 信仰・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(1)] });
