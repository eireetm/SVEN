// BP08-083 Zealot of Silence — Abysscraft follower, 3, 3/1. 絶傑・死霊術師・キラー.
// Rush.
// During your turn, when an opponent discards a card, you may pay 1 to put this follower from your
// cemetery onto the field. The ability is valid only in the cemetery (ruling, CR 10.3.5,
// 10.4.7.4).
import { playPointsCost } from "../costs";
import { defineCard, whenOpponentDiscards } from "../helpers";

const fromCemetery = {
  ...whenOpponentDiscards({
    triggerIf: (g, c) => g.activePlayer === c,
    cost: playPointsCost(1),
    *resolve(fx) {
      if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putOntoField([fx.self]);
    },
  }),
  validIn: ["cemetery"] as const,
};

export default defineCard({ keywords: ["rush"], abilities: [fromCemetery] });
