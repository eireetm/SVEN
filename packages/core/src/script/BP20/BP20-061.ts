// BP20-061 Spoiled Mermanager (Evolved) — 3/3.
// On Evolve - Discard a Marine card: Look at the top 2 cards of your deck. You may put a Marine card from among them into
// your EX area. Put the rest on the bottom of your deck in any order. Give your leader {[defense]}+1.
import { defineCard, onEvolve } from "../helpers";
import { mermanager } from "./shared-dragon";

export default defineCard({
  abilities: [onEvolve(mermanager)],
});
