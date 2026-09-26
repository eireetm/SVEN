// BP16-009 Aerin, Crystalian Frostward — Forestcraft follower, 3, 3/3. クリスタリア.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Select an enemy follower on the field. It can't attack enemies during its controller's next turn.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { frostwardLock } from "./shared-forest";

export default defineCard({
  keywords: ["ward"],
  abilities: [evolveAbility(1), fanfare(frostwardLock)],
});
