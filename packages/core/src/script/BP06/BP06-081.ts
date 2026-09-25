// BP06-081 Cougar Pelt Warrior — Abysscraft follower, 3, 3/2. 獣.
// {[evolve]} {[cost01]}: Evolve this follower.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(1)],
});
