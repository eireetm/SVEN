// BP05-114 Cat Cannoneer — Neutral follower, 3, 3/3. 傭兵・超克.
// {[evolve]} {[cost01]}: Evolve this follower.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [evolveAbility(1)],
});
