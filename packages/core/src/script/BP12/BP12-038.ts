// BP12-038 Regalore, Steel Chimera — Runecraft follower, 14, 6/6. 機械・魔法生物・禁忌.
// This card costs X less. X equals the number of cards with different base costs in your cemetery.
// ----------
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
import { defineCard, evolveAbility } from "../helpers";
import { distinctCostsInCemetery } from "./shared";

export default defineCard({
  keywords: ["ward"],
  playCost: (g, _self, controller) => -distinctCostsInCemetery(g, controller),
  abilities: [evolveAbility(1)],
});
