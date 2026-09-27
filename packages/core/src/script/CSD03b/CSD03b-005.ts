// CSD03b-005 Embodiment of Victory, Aleph (Evolved) — 4/4. (Evolved from CSD03b-004 by name.)
// Twin Drive.
// On Evolve - Look at the top 3 cards of your deck. You may put a Kagero follower not named Dragon Knight, Aleph from among them into
// your EX area. It costs 3 less to play this turn. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, named } from "../targets";
import { followerThat, kagero } from "../CP03/shared";

export default defineCard({
  keywords: ["twinDrive"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        const filter = and(followerThat(kagero), (g, id) => !named("Dragon Knight, Aleph")(g, id));
        const moved = yield* lookAtTopCards(fx, 3, { filter, to: "ex" });
        for (const id of moved) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -3, "endOfTurn");
      },
    }),
  ],
});
