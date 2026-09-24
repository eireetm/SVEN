// BP04-022 Gawain of the Round Table — Swordcraft follower, 5, 5/5. 兵士・円卓.
// Rush.
// {[fanfare]} Reveal 2 Commander or Arthurian cards in your hand: Recover 2 play points. (Any mix
// of the two — ruling.)
// While this card is on your field, the 1st Commander card you play each turn costs 1 less.
// Two copies make it 2 less, it may reach 0, and a Commander card played earlier that turn —
// even before this card came out — was that turn's first (rulings).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare } from "../helpers";
import { hasTrait } from "../targets";

const commanderOrArthurian = (g: GameReader, id: CardId) => hasTrait("指揮官")(g, id) || hasTrait("円卓")(g, id);

export default defineCard({
  keywords: ["rush"],
  field: {
    playCostOf: (g, self, card, player) =>
      player === g.controller(self) &&
      hasTrait("指揮官")(g, card) &&
      !g.cardsPlayedThisTurn(player).some((def) => g.db.get(def).traits.includes("指揮官"))
        ? -1
        : 0,
  },
  abilities: [
    fanfare({
      cost: {
        canPay: (g, c) => g.cards(c, "hand").filter((id) => commanderOrArthurian(g, id)).length >= 2,
        *pay(fx) {
          const cards = fx.game.cards(fx.controller, "hand").filter((id) => commanderOrArthurian(fx.game, id));
          yield* fx.reveal(yield* fx.chooseCards(cards, 2, 2));
        },
      },
      *resolve(fx) {
        yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
