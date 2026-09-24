// BP03-005 Slade, Blossoming Wolf — Forestcraft follower, 2, 2/2. 植物族・獣.
// {[evolve]} {[cost00]}: Evolve. Only if a card on your field was returned to hand this turn
// (any card, not only this one — ruling).
// When returned to hand from your field, you may put a Forestcraft follower costing 2 or less
// from your hand onto the field. That may be this card itself (ruling: it is already in hand).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, evolveAbility, whenReturnedToHand } from "../helpers";
import { isClass, isFollower } from "../targets";

const smallElf = (g: GameReader, id: CardId) =>
  isFollower(g, id) && isClass("Forestcraft")(g, id) && (g.info(id).cost ?? 99) <= 2;

export default defineCard({
  abilities: [
    { ...evolveAbility(0), condition: (g, p) => g.returnedToHandThisTurn(p) >= 1 },
    whenReturnedToHand({
      *resolve(fx) {
        const hand = fx.game.cards(fx.controller, "hand").filter((id) => smallElf(fx.game, id));
        if (hand.length === 0 || !(yield* fx.confirm())) return;
        const [id] = yield* fx.selectCards(hand, 1, 1);
        if (id) yield* fx.putOntoField([id]);
      },
    }),
  ],
});
