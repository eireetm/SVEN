// BP13-116 Armored Goblin — Neutral follower, 2, 2/2. ゴブリン.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(1)] });
