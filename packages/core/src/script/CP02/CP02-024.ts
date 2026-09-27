// CP02-024 Uzuki Shimamura (Evolved) — 4/4.
// On Evolve - Search your deck for a follower with "Rin Shibuya" or "Mio Honda" in its name, put it into your EX area, then
// shuffle your deck. It costs 2 less to play this turn.
import { defineCard, onEvolve } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const found = yield* fx.search(
          (id) => isFollower(g, id) && g.info(id).names.some((n) => n.includes("Rin Shibuya") || n.includes("Mio Honda")),
          { to: "ex" },
        );
        for (const id of found) yield* fx.changePlayCost(id, -2, "endOfTurn");
      },
    }),
  ],
});
