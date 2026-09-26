// BP16-105 Ironfist Priest — Havencraft follower, 4, 4/4. 信仰.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(1)] });
