// BP05-043 Iron Staff Mechanic (Evolved) — Runecraft follower, 5/5. 魔法使い・超克.
// On Evolve: Search your deck for a card that costs 1 play point, put it into your EX area, then
// shuffle your deck. It costs 1 less to play this turn.
import { defineCard, onEvolve } from "../helpers";
import { searchCostOneToEx } from "./shared";

export default defineCard({
  abilities: [onEvolve({ resolve: searchCostOneToEx })],
});
