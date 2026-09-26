// BP18-014 Verdant Law Supplicant — Forestcraft follower, 1, 1/1. 透京・植物族.
// {[evolve]} {[cost00]}: Evolve this. Activate only if a follower on your field has evolved this turn. (An advanced activated
// ability doesn't count — rulings.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(0, { condition: (g, c) => g.followerEvolvedThisTurn(c) })],
});
