// BP02-073 Underworld Watchman Khawy — Abysscraft follower, 5, 5/5.
// Ward.
// {[lastwords]} Select an enemy follower on the field. Destroy it and give your leader
// {[defense]}+X. X equals the selected follower's attack (its modified attack — ruling).
import { defineCard, lastWords } from "../helpers";
import { enemyFollower } from "../targets";
import { destroyAndGainItsAttack } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [lastWords({ targets: [enemyFollower()], resolve: destroyAndGainItsAttack })],
});
