// BP02-010 Baalt, King of the Elves — Forestcraft follower, 4, 3/3.
// {[fanfare]} Choose one of the following. (1) Select a Pixie follower on your field and give it
// {[attack]}+2/{[defense]}+2. (2) Search your deck for a Pixie follower, reveal it, and add it to
// your hand. ((1) cannot be chosen without a Pixie to select — ruling, CR 5.18.3.1.2.)
import { defineCard, fanfare } from "../helpers";
import { and, hasTrait, isFollower, yourFollower } from "../targets";

const pixieFollower = and(isFollower, hasTrait("妖精"));

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "1",
          label: "Give a Pixie follower on your field +2/+2",
          targets: [yourFollower({ filter: pixieFollower })],
          *resolve(fx) {
            yield* fx.giveStats(fx.targets[0]![0]!, 2, 2);
          },
        },
        {
          id: "2",
          label: "Search your deck for a Pixie follower",
          *resolve(fx) {
            yield* fx.search((id) => pixieFollower(fx.game, id));
          },
        },
      ],
    }),
  ],
});
