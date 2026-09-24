// BP03-094 Wingy, Chirpy Gemstone — Havencraft follower, 1, 1/1. 信仰・鳥族.
// {[evolve]} {[cost02]}: Evolve. Ward.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["ward"], abilities: [evolveAbility(2)] });
