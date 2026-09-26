// BP12-052 Shipsbane Plesiosaurus — Dragoncraft follower, 5, 5/5. 自然・竜族・海洋.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Banish a Naterran Great Tree on your field: Draw a card.
// During your turn, whenever you discard 1 or more cards, select an enemy leader or enemy follower on the
// field and deal it 2 damage. (Once for cards discarded together, e.g. at the hand limit — rulings.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { banishFromYour } from "../costs";
import { isTree } from "./shared";
import { plesiosaurusDiscard } from "./shared-dragon";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: banishFromYour(["field"], isTree, 1),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    plesiosaurusDiscard,
  ],
});
