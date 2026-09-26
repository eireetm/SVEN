// BP18-071 Lightning-Clawed Loafer — Dragoncraft follower, 1, 4/1. 透京・ドラゴニュート・武闘竜人.
// {[evolve]} {[cost03]}: Evolve this.
// While there's another Draconic Duelist follower on your field, this has Rush and Assail. (A passive ability; an attack
// already declared goes on if it loses them — rulings.)
// At the start of your end phase, return this to its owner's hand.
import { defineCard, evolveAbility } from "../helpers";
import { loaferPassive, loaferReturn } from "./shared-dragon";

export default defineCard({
  field: { keywordsFor: loaferPassive(["rush", "assail"]) },
  abilities: [evolveAbility(3), loaferReturn],
});
