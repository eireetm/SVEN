// BP19-066 Razor-Clawed Thief — Dragoncraft follower, 1, 2/1. 八獄・ドラゴニュート.
// This can't be played from the EX area.
// Rush. Assail.
// {[lastwords]} Put this into its owner's EX area.
import { defineCard } from "../helpers";
import { backToEx, notFromEx } from "./shared-dragon";

export default defineCard({
  keywords: ["rush", "assail"],
  playableIf: notFromEx,
  abilities: [backToEx],
});
