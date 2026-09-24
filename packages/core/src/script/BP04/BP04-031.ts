// BP04-031 Round Table Assembly — Swordcraft spell, 1. 指揮官・円卓.
// Choose one: (1) Search your deck for an Arthurian follower, reveal it, and add it to your hand.
// (2) Select an Arthurian follower on your field and give it +1/+2.
import { defineCard, spell } from "../helpers";
import { hasTrait, isFollower, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "search",
          label: "Search for an Arthurian follower",
          *resolve(fx) {
            yield* fx.search((id) => isFollower(fx.game, id) && hasTrait("円卓")(fx.game, id));
          },
        },
        {
          id: "buff",
          label: "An Arthurian follower of yours gets +1/+2",
          targets: [yourFollower({ filter: hasTrait("円卓") })],
          *resolve(fx) {
            yield* fx.giveStats(fx.targets[0]![0]!, 1, 2);
          },
        },
      ],
    }),
  ],
});
