// BP03-025 Castle in the Sky — Swordcraft amulet, 2. 指揮官.
// (BP03-026 is the same card.)
// {[fanfare]} Search for a follower with Storm. Printed or already-given keywords only;
// a fanfare that might grant Storm does not count (ruling).
// Activate {[engage]}, bury this: +1 attack to a follower with Storm on your field.
// {[act]} {[cost10]}, {[engage]}, bury this: You may put any number of followers with Storm
// from your hand onto your field and give them +2/+2.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { activated, defineCard, fanfare } from "../helpers";
import { isFollower, yourFollower } from "../targets";

const storm = (g: GameReader, id: CardId) => g.info(id).keywords.includes("storm");

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isFollower(fx.game, id) && storm(fx.game, id));
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: storm })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
        },
      },
    ),
    activated(
      { playPoints: 10, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          const hand = fx.game.cards(fx.controller, "hand").filter((id) => isFollower(fx.game, id) && storm(fx.game, id));
          if (hand.length === 0) return;
          const chosen = yield* fx.selectCards(hand, 0, hand.length);
          const entered = yield* fx.putOntoField(chosen);
          for (const id of entered) yield* fx.giveStats(id, 2, 2);
        },
      },
    ),
  ],
});
