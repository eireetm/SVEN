// BP19-005 Verdant Lieutenant — Forestcraft follower, 2, 2/2. 八獄・エルフ族.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever a Condemned follower on your field evolves, Combo (3) - Draw a card. (Super-evolving too — ruling.)
import { defineCard, evolveAbility } from "../helpers";
import { lieutenantDraw } from "./shared-forest";

export default defineCard({
  abilities: [evolveAbility(1), lieutenantDraw],
});
