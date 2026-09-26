// BP19-068 Dancing Crab — Dragoncraft follower, 3, 3/3. 海洋.
// {[evolve]} {[cost01]}: Evolve this.
// Intimidate.
// Strike - Select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1. (Attack can go below 0 — ruling.)
import { defineCard, evolveAbility, strike } from "../helpers";
import { crabPinch } from "./shared-dragon";

export default defineCard({
  keywords: ["intimidate"],
  abilities: [evolveAbility(1), strike(crabPinch)],
});
