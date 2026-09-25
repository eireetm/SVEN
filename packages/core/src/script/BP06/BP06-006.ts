// BP06-006 Wildwood Matriarch (Evolved) — Forestcraft follower, 4/4. 狩人.
// On Evolve: Select up to 2 Hunter followers that cost 2 or less in your cemetery and summon them.
// (Together: each sees the other enter — rulings.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { count: 2, upTo: true, filter: and(isFollower, hasTrait("狩人"), costAtMost(2)) })],
      *resolve(fx) {
        yield* fx.putOntoField((fx.targets[0] ?? []).filter((id) => fx.game.card(id)?.zone === "cemetery"));
      },
    }),
  ],
});
