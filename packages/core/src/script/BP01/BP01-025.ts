// BP01-025 Woodland Refuge — Forestcraft amulet, 1.
// {[fanfare]} Select a Pixie follower on your field and give it +1 attack.
// {[act]}{[cost01]}, {[engage]}: Return this card to its owner's hand.
import { activated, defineCard, fanfare } from "../helpers";
import { hasTrait, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower({ filter: hasTrait("妖精") })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.returnToHand([fx.self]);
        },
      },
    ),
  ],
});
