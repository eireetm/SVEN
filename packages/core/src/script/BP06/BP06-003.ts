// BP06-003 Amataz, Fairy Blader — Forestcraft follower, 2, 2/2. エルフ族・精霊.
// {[fanfare]} Put a Fairy token into your EX area. Give each Pixie follower in your EX area
// {[attack]}+1/{[defense]}+1. (They keep it when played or put onto the field from there — ruling,
// CR 4.8.3.3.)
// Activate {[engage]}: Select up to 2 Pixie followers that cost 1 or less on your field and give
// them Storm.
import { activated, defineCard, fanfare } from "../helpers";
import { and, costAtMost, hasTrait, isFollower, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy"]);
        for (const id of fx.game.cards(fx.controller, "ex")) {
          if (and(isFollower, hasTrait("妖精"))(fx.game, id)) yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [yourFollower({ count: 2, upTo: true, filter: and(hasTrait("妖精"), costAtMost(1)) })],
        *resolve(fx) {
          for (const id of fx.targets[0] ?? []) yield* fx.giveKeyword(id, "storm");
        },
      },
    ),
  ],
});
