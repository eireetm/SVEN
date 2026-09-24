// BP03-018 Cinderella — Swordcraft follower, 7, 5/5. プリンセス・童話.
// (BP03-019 Salome is an alternate-name printing of this card, CR 2.13.)
// Storm.
// {[fanfare]} If another Fable follower is on your field, put a Fable counter on this card.
// Strike, remove a Fable counter: Look at the top 4. You may put a follower costing 5 or less
// onto your field. Put the rest into your cemetery.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare, strike } from "../helpers";
import { hasTrait, isFollower } from "../targets";

const otherFable = (g: GameReader, self: CardId) =>
  g.followers(g.controller(self)).some((id) => id !== self && hasTrait("童話")(g, id));

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (otherFable(fx.game, fx.self)) yield* fx.addCounters(fx.self, "fable", 1);
      },
    }),
    strike({
      cost: {
        canPay: (g, _c, self) => g.counters(self, "fable") >= 1,
        *pay(fx) {
          yield* fx.removeCounters(fx.self, "fable", 1);
        },
      },
      *resolve(fx) {
        const top = fx.topCards(4);
        const matching = top.filter((id) => isFollower(fx.game, id) && (fx.game.info(id).cost ?? 99) <= 5);
        const [chosen] = yield* fx.selectCards(matching, 0, 1, fx.controller, top);
        if (chosen) yield* fx.putOntoField([chosen]);
        const rest = top.filter((id) => fx.game.card(id)?.zone === "deck");
        if (rest.length > 0) yield* fx.bury(rest);
      },
    }),
  ],
});
