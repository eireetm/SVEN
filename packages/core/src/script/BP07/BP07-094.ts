// BP07-094 Robofalcon — Havencraft follower, 2, 1/3. 機械・鳥族.
// {[evolve]} {[cost01]}: Evolve this follower.
// Storm.
// Strike - Put a Repair Mode token into your EX area. Then, if there are at least 3 cards named Repair
// Mode in your EX area, give this follower {[attack]}+1.
import { defineCard, evolveAbility } from "../helpers";
import { robofalconStrike } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [evolveAbility(1), robofalconStrike],
});
