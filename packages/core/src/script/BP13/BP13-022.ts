// BP13-022 Sera, Maiden of the Dawn — Swordcraft follower, 4, 4/3. 指揮官.
// {[evolve]} {[cost01]}: Evolve this follower.
// Your token followers don't take ability damage. (Every damage but combat damage to followers and
// attack damage to leaders — ruling.)
// During your turn, whenever an Officer follower is put onto your field, give your leader {[defense]}+1.
import { defineCard, evolveAbility } from "../helpers";
import { officerEnters, tokensTakeNoAbilityDamage } from "./shared-sword";

export default defineCard({ field: tokensTakeNoAbilityDamage, abilities: [evolveAbility(1), officerEnters] });
