// BP18-009 Verdant City Pugilist — Forestcraft follower, 2, 1/1. 透京・植物族.
// {[evolve]} {[cost01]}: Evolve this.
// You may play any number of Evolve per turn. (CR 8.3.2.2.)
// Whenever a follower on your field evolves, select a Togh Keyoh follower on your field and give it
// {[attack]}+1/{[defense]}+1.
import { defineCard, evolveAbility } from "../helpers";
import { pugilistBoost } from "./shared-forest";

export default defineCard({
  field: { unlimitedEvolve: true },
  abilities: [evolveAbility(1), pugilistBoost],
});
