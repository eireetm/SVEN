// BP09-064 Heroic Dragonslayer (Evolved) — Dragoncraft follower, 2/3. 竜族・キラー.
// On Evolve - Select an enemy follower on the field and deal it damage equal to this follower's attack.
// (Its current attack, raised by its Fanfare for example — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEqualToAttack } from "./shared";

export default defineCard({
  abilities: [onEvolve({ targets: [enemyFollower()], resolve: damageEqualToAttack })],
});
