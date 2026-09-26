// BP21-077 Arka, Sin Spinner — Abysscraft follower, 2, 2/2. 魔界・学院.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever you roll a 6-sided die, select an enemy follower on the field and deal it 1 damage. If you roll a 6, deal it 3
// damage instead.
import { defineCard, evolveAbility } from "../helpers";
import { arkaSpin } from "./shared-abyss";

export default defineCard({
  abilities: [evolveAbility(1), arkaSpin],
});
