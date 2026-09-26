// BP20-060 Spoiled Mermanager — Dragoncraft follower, 2, 2/2. 海洋.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard a Marine card: Look at the top 2 cards of your deck. You may put a Marine card from among them into
// your EX area. Put the rest on the bottom of your deck in any order. Give your leader {[defense]}+1.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { mermanager } from "./shared-dragon";

export default defineCard({
  abilities: [evolveAbility(1), fanfare(mermanager)],
});
