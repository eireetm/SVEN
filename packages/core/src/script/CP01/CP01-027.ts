// CP01-027 Agnes Tachyon — Runecraft follower, 2, 2/2. ウマ娘.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Whenever you play a spell, select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1.
import { defineCard, evolveAbility, serveAbility } from "../helpers";
import { tachyonSpellPlayed } from "./shared";

export default defineCard({
  abilities: [evolveAbility(1), serveAbility(1, 1), tachyonSpellPlayed()],
});
