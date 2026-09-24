// BP03-107 Alice, Wonderland Explorer — Neutral follower, 3, 3/3. 童話.
// {[evolve]} {[cost01]}: Evolve.
// {[fanfare]} Put a Fable counter on this card.
// Activate, remove a Fable counter: Put a Fable counter on a Fable follower on your field or in your EX area.
import { activated, defineCard, evolveAbility, fanfare } from "../helpers";
import { hasTrait, isFollower } from "../targets";

const fableFollower = (g: import("../../engine/query").GameReader, id: import("../../model/ids").CardId) =>
  isFollower(g, id) && hasTrait("童話")(g, id);

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.addCounters(fx.self, "fable", 1);
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
