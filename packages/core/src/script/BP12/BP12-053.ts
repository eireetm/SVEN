// BP12-053 Shipsbane Plesiosaurus (Evolved) — Dragoncraft follower, 6/6. 自然・竜族・海洋.
// On Evolve - Discard a card: Give your leader {[defense]}+2.
// During your turn, whenever you discard 1 or more cards, select an enemy leader or enemy follower on the
// field and deal it 2 damage. (Once for cards discarded together, e.g. at the hand limit — rulings.)
import { defineCard, onEvolve } from "../helpers";
import { discardCardsCost } from "../costs";
import { plesiosaurusDiscard } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardCardsCost(1),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
    plesiosaurusDiscard,
  ],
});
