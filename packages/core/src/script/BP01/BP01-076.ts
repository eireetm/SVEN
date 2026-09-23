// BP01-076 Dark Dragoon Forte — Dragoncraft follower, 4, 5/1.
// {[evolve]}{[cost02]}: Evolve this follower. // Storm.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["storm"], abilities: [evolveAbility(2)] });
