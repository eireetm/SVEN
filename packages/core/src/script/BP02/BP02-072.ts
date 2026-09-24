// BP02-072 Soul Dealer (Evolved) — 7/6.
// Ward.
// On Evolve: Select an enemy follower on the field. Destroy it and give your leader {[defense]}+X.
// X equals the selected follower's attack (its modified attack — ruling).
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { destroyAndGainItsAttack } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [onEvolve({ targets: [enemyFollower()], resolve: destroyAndGainItsAttack })],
});
