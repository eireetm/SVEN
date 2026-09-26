// BP11-008 Varmint Hunter — Forestcraft follower, 3, 3/3. 荒野・狩人.
// {[evolve]} {[cost01]}: Evolve this follower.
// During your turn, whenever a Mount card is put into your EX area, select an enemy follower on the
// field and deal it 3 damage. (Twice for two at once — ruling.)
import { defineCard, evolveAbility } from "../helpers";
import { varmintShot } from "./shared-forest";

export default defineCard({ abilities: [evolveAbility(1), varmintShot()] });
