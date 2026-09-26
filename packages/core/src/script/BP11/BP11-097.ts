// BP11-097 Enchanted Knight — Havencraft follower, 1, 1/1. 信仰.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(1)] });
