// BP07-091 Marlone, Light of Balance (Evolved) — 4/4.
// On Evolve - Select an enemy follower costs X or less on the field and destroy it. X equals the
// number of cards in your EX area. (元のコスト: an evolved follower has its unevolved card's cost —
// ruling, CR 5.16.1.2.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [
        {
          count: 1,
          candidates: (g, c) => {
            const x = g.cards(c, "ex").length;
            return g.followers(g.opponent(c)).filter((id) => (g.info(id).cost ?? Number.POSITIVE_INFINITY) <= x);
          },
        },
      ],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
