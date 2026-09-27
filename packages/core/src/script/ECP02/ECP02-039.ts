// ECP02-039 Akira Sunazuka [Online Life] — Dragoncraft follower, 5, 3/3. デレマス・クール.
// {[fanfare]}, Lesson (1): Look at the top 3 cards of your deck. You may reveal an iM@S CG card from among them and add it to your
// hand. Put the rest on the bottom of your deck in any order. (This printing's English says "iM@S card".)
// Activate {[engage]} this, discard a Cute card, Cool card, and Passion card: Give your leader {[defense]}+3. Draw 3 cards. Recover
// 3 play points. (3 different cards: a card with several of the types counts as one of them — ruling. Chosen one at a time,
// each time only among those that still let the rest be chosen.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { lesson } from "../costs";
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { TYPES, canFill, imas } from "./shared";

const hand = (g: GameReader, c: PlayerId) => g.cards(c, "hand");

const discardThreeTypes: CustomCost = {
  canPay: (g, c) => canFill(g, hand(g, c), TYPES),
  *pay(fx) {
    const g = fx.game;
    let left = hand(g, fx.controller);
    const chosen: CardId[] = [];
    for (let i = 0; i < TYPES.length; i++) {
      const rest = TYPES.slice(i + 1);
      const options = left.filter((id) => TYPES[i]!(g, id) && canFill(g, left.filter((x) => x !== id), rest));
      const [pick] = yield* fx.chooseCards(options, 1, 1);
      if (pick === undefined) return;
      chosen.push(pick);
      left = left.filter((x) => x !== pick);
    }
    yield* fx.discardCards(chosen);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      cost: lesson(1),
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: imas, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, custom: discardThreeTypes },
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 3);
          yield* fx.draw(3);
          yield* fx.recoverPlayPoints(3);
        },
      },
    ),
  ],
});
