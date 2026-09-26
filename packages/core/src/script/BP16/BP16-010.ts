// BP16-010 Aerin, Crystalian Frostward (Evolved) — Forestcraft follower, 4/4. クリスタリア.
// Ward.
// On Evolve - Search your deck for a Crystalian follower that costs 2 or less, put it into your EX area, then
// shuffle. It costs 2 less to play this turn. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { crystalian } from "./shared";

const found = and(isFollower, crystalian, costAtMost(2));

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        for (const id of yield* fx.search((c) => found(fx.game, c), { to: "ex" })) yield* fx.changePlayCost(id, -2, "endOfTurn");
      },
    }),
  ],
});
