// BP16-094 Rodeo, Anathema of Judgment — Havencraft follower, 4, 3/4. アナテマ・先導.
// {[evolve]} {[cost01]}: Evolve this.
// At the start of your end phase, if there are at least 2 amulets on your field, give your leader {[defense]}+2.
import { defineCard, evolveAbility } from "../helpers";
import { rodeoBlessing } from "./shared-haven";

export default defineCard({ abilities: [evolveAbility(1), rodeoBlessing] });
