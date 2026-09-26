// BP21-041 Grea, Crimson Promise — Runecraft follower, 2, 2/2. 魔法使い・学院・プリンセス.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard an Academic card: Draw a card.
import { defineCard, evolveAbility } from "../helpers";
import { discardAcademicToDraw } from "./shared-rune";

export default defineCard({
  abilities: [evolveAbility(1), discardAcademicToDraw],
});
