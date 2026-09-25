// BP06-044 Demoncaller — Runecraft follower, 3, 3/3. 陰陽師.
// {[evolve]} {[cost01]}: Evolve this follower.
// Whenever a Shikigami follower is put onto your field, give it {[attack]}+1 and Rush.
import { defineCard, evolveAbility } from "../helpers";
import { demoncallerBoost } from "./shared";

export default defineCard({
  abilities: [evolveAbility(1), demoncallerBoost],
});
