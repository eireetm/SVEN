// BP03-108 Alice, Wonderland Explorer (Evolved) — Neutral, 4/4.
// On Evolve: Look at the top 4. You may put up to 2 Fable cards into your EX area. Rest on the bottom.
// Activate, remove a Fable counter: Put a Fable counter on a Fable follower on your field or in your EX area.
import { activated, defineCard, onEvolve } from "../helpers";
import { hasTrait, isFollower } from "../targets";

const fableFollower = (g: import("../../engine/query").GameReader, id: import("../../model/ids").CardId) =>
  isFollower(g, id) && hasTrait("童話")(g, id);

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const top = fx.topCards(4);
        const matching = top.filter((id) => hasTrait("童話")(fx.game, id));
        const chosen = yield* fx.selectCards(matching, 0, Math.min(2, matching.length), fx.controller, top);
        if (chosen.length > 0) yield* fx.putIntoEx(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
    activated(
      {
        custom: {
          canPay: (g, _c, self) => g.counters(self, "fable") >= 1,
          *pay(fx) {
            yield* fx.removeCounters(fx.self, "fable", 1);
          },
        },
      },
      {
        *resolve(fx) {
          const cards = [...fx.game.cards(fx.controller, "field"), ...fx.game.cards(fx.controller, "ex")].filter((id) =>
            fableFollower(fx.game, id),
          );
          if (cards.length === 0) return;
          const [id] = yield* fx.selectCards(cards, 1, 1);
          if (id) yield* fx.addCounters(id, "fable", 1);
        },
      },
    ),
  ],
});
