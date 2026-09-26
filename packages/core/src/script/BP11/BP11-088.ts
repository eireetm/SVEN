// BP11-088 Anvelt, Judgment's Cannon (Evolved) — Havencraft follower, 5/6. 荒野・信仰.
// Ward.
// On Evolve - Select up to 2 enemy followers on the field and deal them 3 damage. If there's a Wasteland
// card in your EX area, deal 2 damage to each enemy leader.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { anveltBarrage } from "./shared-haven";

export default defineCard({
  keywords: ["ward"],
  abilities: [onEvolve({ targets: [enemyFollower({ count: 2, upTo: true })], resolve: anveltBarrage })],
});
