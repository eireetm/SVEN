// BP06-084 Zashiki-Warashi — Abysscraft follower, 2, 2/2. 妖怪.
// {[evolve]} {[cost01]}: Evolve this follower.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(1)],
});
