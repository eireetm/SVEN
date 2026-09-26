// BP16-065 Eyfa, Windrider — Dragoncraft follower, 2, 2/2. 竜使い.
// {[evolve]} {[cost01]}: Evolve this.
// Storm. Intimidate.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({ keywords: ["storm", "intimidate"], abilities: [evolveAbility(1)] });
