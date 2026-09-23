// BP01-166 Harnessed Flame — Neutral follower, 3, 3/2.
// {[act]}{[cost01]}, put this card and a Harnessed Glass from your field into their owners'
// cemeteries: Search your deck for a Flame and Glass and put it onto your field.
// (Playable without a Flame and Glass in the deck; the cost stays paid — ruling.)
import { activated, defineCard } from "../helpers";
import { named } from "../targets";

const glassOnField = (g: import("../../engine/query").GameReader, c: import("../../model/ids").PlayerId) =>
  g.cards(c, "field").filter((id) => named("Harnessed Glass")(g, id));

export default defineCard({
  abilities: [
    activated(
      {
        playPoints: 1,
        custom: {
          canPay: (g, c) => glassOnField(g, c).length > 0,
          *pay(fx) {
            const [glass] = yield* fx.chooseCards(glassOnField(fx.game, fx.controller), 1, 1);
            yield* fx.bury([fx.self, glass!]);
          },
        },
      },
      {
        *resolve(fx) {
          yield* fx.search((id) => named("Flame and Glass")(fx.game, id), { to: "field" });
        },
      },
    ),
  ],
});
