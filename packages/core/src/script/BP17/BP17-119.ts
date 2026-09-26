// BP17-119 Aiolon's Remains — Neutral amulet, 2. 機械.
// {[fanfare]} Discard a Machina card: Draw 2 cards. If there are at least 3 Machina cards in your EX area, recover 1 play
// point. (Both sentences are the effect after the colon, only if the card is discarded, CR 10.4.7.4.)
// Activate {[engage]} this, bury this: Choose 1. (1) Select a Machina follower on your field and give it {[defense]}+1.
// (2) Give your leader {[defense]}+1.
import { discardA } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";
import { machina, machinaInEx } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(machina),
      *resolve(fx) {
        yield* fx.draw(2);
        if (machinaInEx(fx.game, fx.controller) >= 3) yield* fx.recoverPlayPoints(1);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        modes: [
          {
            id: "follower",
            label: "(1) A Machina follower of yours +0/+1",
            targets: [yourFollower({ filter: machina })],
            *resolve(fx) {
              yield* fx.giveStats(fx.targets[0]![0]!, 0, 1);
            },
          },
          {
            id: "leader",
            label: "(2) Leader +1",
            *resolve(fx) {
              yield* fx.giveLeaderDefense(fx.controller, 1);
            },
          },
        ],
      },
    ),
  ],
});
