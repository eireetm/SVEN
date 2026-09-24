// BP03-017 Woodland Band — Forestcraft amulet, 1. 獣・童話.
// {[fanfare]} Look at the top 4. You may put a Fable follower into your EX area. Rest on the bottom.
// Activate {[engage]}, bury this: Select a Fable follower on your field and put a Fable counter on it.
import { activated, defineCard, fanfare } from "../helpers";
import { hasTrait, isFollower, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(4);
        const matching = top.filter((id) => isFollower(fx.game, id) && hasTrait("童話")(fx.game, id));
        const [chosen] = yield* fx.selectCards(matching, 0, 1, fx.controller, top);
        if (chosen) yield* fx.putIntoEx([chosen]);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: hasTrait("童話") })],
        *resolve(fx) {
          yield* fx.addCounters(fx.targets[0]![0]!, "fable", 1);
        },
      },
    ),
  ],
});
