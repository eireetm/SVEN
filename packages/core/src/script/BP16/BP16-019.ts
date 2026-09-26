// BP16-019 Amelia, Silver Captain — Swordcraft follower, 2, 2/2. 指揮官.
// {[evolve]} {[cost01]}: Evolve this.
// At the start of your end phase, you may put a Steelclad Knight, Shield Guardian, or Knight token into your EX
// area.
import { defineCard, evolveAbility } from "../helpers";
import { ameliaSupplies } from "./shared-sword";

export default defineCard({ abilities: [evolveAbility(1), ameliaSupplies] });
