// BP07-005 Setus, the Beastblade — Forestcraft follower, 5, 3/5. 獣.
// {[evolve]} {[cost02]}: Evolve this follower.
// Ward.
// At the start of your end phase, give your leader {[defense]}+4 and, if a follower was put from
// your field into the cemetery this turn, give this follower {[attack]} +2/{[defense]}+2.
import { defineCard, evolveAbility } from "../helpers";
import { setusEndPhase } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [evolveAbility(2), setusEndPhase],
});
