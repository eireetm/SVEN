// BP15-062 Mermaid of Punishment — Dragoncraft follower, 5, 3/3. 海洋.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever another Marine follower is put onto your field, deal 1 damage to each enemy leader.
import { defineCard, evolveAbility } from "../helpers";
import { mermaidOfPunishment } from "./shared-dragon";

export default defineCard({
  abilities: [evolveAbility(1), mermaidOfPunishment()],
});
