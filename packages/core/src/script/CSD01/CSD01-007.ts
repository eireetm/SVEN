// CSD01-007 Tazuna Hayakawa [Tracen Reception] — Neutral follower, 6, 3/5. トレセン学園.
// Ward.
// {[fanfare]} Select an Umamusume follower or Umamusume amulet that costs 4 play points or less in your cemetery and put it onto
// your field.
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, isAmulet, isFollower } from "../targets";
import { umamusume } from "../CP01/shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(umamusume, costAtMost(4), (g, id) => isFollower(g, id) || isAmulet(g, id)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
