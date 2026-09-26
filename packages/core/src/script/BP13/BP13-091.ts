// BP13-091 Lunerian Paladin — Havencraft follower, 2, 1/1. 信仰・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(1)] });
