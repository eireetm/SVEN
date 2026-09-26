// BP15-060 Celestial Dragoon — Dragoncraft follower, 1, 1/1. 竜使い.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever you discard a card, engage this: Draw a card.
import { defineCard, evolveAbility } from "../helpers";
import { celestialDragoonDraw } from "./shared-dragon";

export default defineCard({
  abilities: [evolveAbility(1), celestialDragoonDraw()],
});
