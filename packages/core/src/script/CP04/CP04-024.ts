// CP04-024 Jun (Evolved) — Swordcraft, 4/5. プリコネ・NIGHTMARE.
// {[ub]} On Evolve - Search your deck for up to 2 Nightmare followers not named Jun, put them into your EX area, then shuffle. The
// next Nightmare follower you play this turn costs 2 less. (The English text ends with a stray "turn.".)
// Ward.
import { defineCard, onEvolve, ub } from "../helpers";
import { named } from "../targets";
import { followerThat, nightmare } from "./shared";

const nightmareFollower = followerThat(nightmare);

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      onEvolve({
        *resolve(fx) {
          yield* fx.search((id) => nightmareFollower(fx.game, id) && !named("Jun")(fx.game, id), { max: 2, to: "ex" });
          yield* fx.nextPlayCostsLess("nightmare", 2);
        },
      }),
    ),
  ],
  nextPlay: { nightmare: (g, card) => nightmareFollower(g, card) },
});
