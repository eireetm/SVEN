// BP20-118 Apostle of Voracity — Neutral follower, 4, 3/3. 絶傑・獣.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select another follower on the field and give it {[attack]}+2/{[defense]}-2.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { apostleBoost } from "./shared-neutral";

export default defineCard({
  abilities: [evolveAbility(1), fanfare(apostleBoost)],
});
