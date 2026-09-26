// BP19-064 Hotheaded Marauder — Dragoncraft follower, 2, 2/2. 八獄・ドラゴニュート.
// This can't be played from the EX area.
// {[evolve]} {[cost01]}: Evolve this.
// {[lastwords]} Put this into its owner's EX area.
import { defineCard, evolveAbility } from "../helpers";
import { backToEx, notFromEx } from "./shared-dragon";

export default defineCard({
  playableIf: notFromEx,
  abilities: [evolveAbility(1), backToEx],
});
