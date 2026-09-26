// BP11-042 Artistic Arcanist — Runecraft follower, 3, 1/4. 魔法使い.
// {[evolve]} {[cost02]}: Evolve this follower.
// Rush. Bane. Drain.
// Activate, Earth Rite: Select another follower on your field and give it Rush, Bane, or Drain. (Also
// more than once a turn — ruling.)
import { defineCard, evolveAbility } from "../helpers";
import { arcanistRite } from "./shared-rune";

export default defineCard({ keywords: ["rush", "bane", "drain"], abilities: [evolveAbility(2), arcanistRite()] });
