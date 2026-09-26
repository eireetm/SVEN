// BP08-111 Reina, Evolution's Herald (Evolved) — Neutral follower, 5/5. 光輝.
// On Evolve: select a faceup evolved follower in your evolve deck, turn it facedown, then search
// for a follower. Without a target none of the ability is played (ruling; CR 4.6.3, 10.6.2.3.3).
import { defineCard, onEvolve } from "../helpers";
import { isEvolvedFollower, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [{
        count: 1,
        candidates: (g, p) => g.faceUpEvolveDeck(p).filter((id) => isEvolvedFollower(g, id)),
      }],
      *resolve(fx) {
        yield* fx.turnFacedown(fx.targets[0] ?? []);
        yield* fx.search((id) => isFollower(fx.game, id));
      },
    }),
  ],
});
