// BP11-087 Anvelt, Judgment's Cannon — Havencraft follower, 6, 4/5. 荒野・信仰.
// {[evolve]} {[cost01]}: Evolve this card.
// Ward.
// {[fanfare]} Select up to 2 enemy followers on the field and deal them 3 damage. If there's a Wasteland
// card in your EX area, deal 2 damage to each enemy leader.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { anveltBarrage } from "./shared-haven";

export default defineCard({
  keywords: ["ward"],
  abilities: [evolveAbility(1), fanfare({ targets: [enemyFollower({ count: 2, upTo: true })], resolve: anveltBarrage })],
});
