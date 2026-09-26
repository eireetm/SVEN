// BP13-055 Drache, Fiery Dragonlord (Evolved) — Dragoncraft follower, 6/5. 荒野・ドラゴニュート・武闘竜人.
// Assail.
// On Evolve - Select a Draconic Duelist follower that costs X or less in your cemetery and summon it. X
// equals this follower's attack. (元のコスト; X when the ability is played.)
import type { TargetSpec } from "../types";
import { defineCard, onEvolve } from "../helpers";
import { and, isFollower } from "../targets";
import { draconicDuelist } from "./shared";

const duelistUpToAttack: TargetSpec = {
  count: 1,
  candidates: (g, c, self) =>
    g.cards(c, "cemetery").filter((id) => and(isFollower, draconicDuelist)(g, id) && (g.info(id).cost ?? Infinity) <= (g.info(self).attack ?? 0)),
};

export default defineCard({
  keywords: ["assail"],
  abilities: [
    onEvolve({
      targets: [duelistUpToAttack],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
