// BP09-025 Dario, Demon Count — Swordcraft follower, 4, 4/4. 指揮官・貴族.
// {[evolve]} {[cost01]}: Evolve this follower.
// Assail.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["assail"], abilities: [evolveAbility(1)] });
