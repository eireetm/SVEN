// BP03-006 Slade, Blossoming Wolf (Evolved) — Forestcraft, 3/3.
// On Evolve: Draw a card.
// When returned to hand, you may put a Forestcraft follower costing 2 or less from hand onto the field.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, onEvolve, whenReturnedToHand } from "../helpers";
import { isClass, isFollower } from "../targets";

const smallElf = (g: GameReader, id: CardId) =>
  isFollower(g, id) && isClass("Forestcraft")(g, id) && (g.info(id).cost ?? 99) <= 2;

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
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
