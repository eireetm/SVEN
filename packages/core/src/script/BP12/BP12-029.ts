// BP12-029 Lilje, Butler of the Mists — Swordcraft follower, 2, 2/2. 兵士.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// Each Azord, Duke of the Mists on your field has Storm and "Strike - Give this follower {[attack]}
// +2/{[defense]}+2." (While this card is on the field.)
import { defineCard, evolveAbility } from "../helpers";
import { liljeGivesAzord } from "./shared-sword";

export default defineCard({ keywords: ["ward"], field: liljeGivesAzord, abilities: [evolveAbility(1)] });
