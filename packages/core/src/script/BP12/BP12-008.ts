// BP12-008 Forest Defender — Forestcraft follower, 4, 3/4. 狩人・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// Whenever another Hunter follower on your field attacks, select an enemy follower on the field and deal
// it 3 damage.
import { defineCard, evolveAbility } from "../helpers";
import { forestDefenderTrigger } from "./shared";

export default defineCard({ abilities: [evolveAbility(1), forestDefenderTrigger] });
