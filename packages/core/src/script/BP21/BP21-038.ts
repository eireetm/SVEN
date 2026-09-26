// BP21-038 Anne, Brilliant Mage — Runecraft follower, 3, 3/3. 魔法使い・学院・プリンセス.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard an Academic card: Draw a card.
import { defineCard, evolveAbility } from "../helpers";
import { discardAcademicToDraw } from "./shared-rune";

export default defineCard({
  abilities: [evolveAbility(1), discardAcademicToDraw],
});
