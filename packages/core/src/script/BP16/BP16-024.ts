// BP16-024 Zirconia, Ironcrown Ward (Evolved) — Swordcraft follower, 4/4. 指揮官・貴族.
// On Evolve - Summon a Steelclad Knight and Shield Guardian token. (With room for one, the player picks — ruling.)
// On Super-Evolve - Select up to 2 Officer token followers on your field and give them {[attack]}+1/{[defense]}+1
// and Storm.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { yourFollower } from "../targets";
import { SHIELD_GUARDIAN, STEELCLAD } from "./shared";
import { officerTokenFollower } from "./shared-sword";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([STEELCLAD, SHIELD_GUARDIAN]);
      },
    }),
    onSuperEvolve({
      targets: [yourFollower({ count: 2, upTo: true, filter: officerTokenFollower })],
      *resolve(fx) {
        for (const id of fx.targets[0] ?? []) {
          yield* fx.giveStats(id, 1, 1);
          yield* fx.giveKeyword(id, "storm");
        }
      },
    }),
  ],
});
