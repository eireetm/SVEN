// BP11-076 Wretch — Abysscraft follower, 3, 3/2. 荒野・死者・魔界.
// {[evolve]} {[cost01]}: Evolve this follower. Activate only if this follower was put onto the field
// from the cemetery.
// Rush.
// {[lastwords]} Summon a Bullet Bike token. Bury the top 2 cards of your deck.
import { defineCard, evolveAbility } from "../helpers";
import { bikeAndBury } from "./shared-abyss";

export default defineCard({
  keywords: ["rush"],
  abilities: [evolveAbility(1, { condition: (g, _p, self) => g.enteredFrom(self) === "cemetery" }), bikeAndBury(2)],
});
