// BP13-095 Pyne, Twisted Justice — Havencraft follower, 1, 1/3. 狂信・キラー.
// {[evolve]} {[cost02]}: Evolve this follower.
// Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(2)] });
