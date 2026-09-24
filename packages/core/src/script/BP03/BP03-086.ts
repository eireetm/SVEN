// BP03-086 Mischievous Zombie — Abysscraft follower, 2, 2/2. 死者.
// {[evolve]} {[cost02]}: Evolve.
// {[fanfare]} Discard a card: Summon a Ghost. If you discarded a Departed card, draw a card.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { hasTrait } from "../targets";

const departed = (g: GameReader, id: CardId) => hasTrait("死者")(g, id);

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      cost: {
        canPay: (g, c) => g.cards(c, "hand").length >= 1,
        *pay(fx) {
          const hand = fx.game.cards(fx.controller, "hand");
          const [id] = yield* fx.chooseCards(hand, 1, 1);
          fx.memory.departed = id !== undefined && departed(fx.game, id) ? 1 : 0;
          if (id) yield* fx.discardCards([id]);
        },
      },
      *resolve(fx) {
        yield* fx.summon(["Ghost"]);
        if (fx.memory.departed === 1) yield* fx.draw(1);
      },
    }),
  ],
});
