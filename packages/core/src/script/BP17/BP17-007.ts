// BP17-007 Friendly Embrace — Forestcraft spell, 2. 機械・自然・獣.
// When playing this, engage 2 cards on your field named Naterran Great Tree: This costs 2 less to play. (CR 10.4.7.3;
// reserved ones, 10.4.6.)
// ----------
// Give your leader {[defense]}+1. Draw a card.
import { engageYourCards } from "../costs";
import { defineCard, spell } from "../helpers";
import { isTree } from "./shared";

export default defineCard({
  playOptions: [{ id: "trees", label: "Engage 2 Naterran Great Trees: costs 2 less", ...engageYourCards(isTree, 2), costDelta: -2 }],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
