// BP18-082 Covetous Serpent — Abysscraft follower, 2, 2/2. 透京・魔界・獣.
// {[evolve]} {[cost05]}: Evolve this.
// Activate {[engage]} this, reveal two 2-cost cards from your hand: Select an enemy follower on the field and deal it 4
// damage.
import { defineCard, evolveAbility } from "../helpers";
import { serpentBite } from "./shared-abyss";

export default defineCard({
  abilities: [evolveAbility(5), serpentBite],
});
