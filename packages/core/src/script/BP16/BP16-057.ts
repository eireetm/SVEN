// BP16-057 Burnite, Anathema of Flame — Dragoncraft follower, 7, 5/5. アナテマ・ドラゴニュート.
// This costs 2 less to play if there are at least 4 {[dragoncraft]} cards in your cemetery that cost 7 or more.
// ----------
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard a card: Select an enemy follower on the field. Deal it damage equal to the discarded card's
// cost and draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { bigDragonsInCemetery, burniteFlames } from "./shared-dragon";

export default defineCard({
  playCost: (g, _self, p) => (bigDragonsInCemetery(g, p) >= 4 ? -2 : 0),
  abilities: [evolveAbility(1), fanfare(burniteFlames)],
});
