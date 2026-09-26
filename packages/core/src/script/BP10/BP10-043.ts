// BP10-043 Scourge of the Omniscient — Runecraft spell, 1. アルカナ・魔法使い・キラー.
// This card can't be played from the EX area.
// At the start of your end phase, if this card is in your EX area, deal 1 damage to each enemy leader.
// (Valid in the EX area, CR 10.3.5; each copy triggers; playing it is not playing a spell — rulings.)
// ----------
// Deal 2 damage to each enemy leader. If there's a 0. Lhynkal, The Fool on your field, put this card
// into its owner's EX area.
import { atStartOfYourEndPhase, defineCard, spell } from "../helpers";
import { toExWithLhynkal } from "./shared";

export default defineCard({
  playableIf: (g, self) => g.playZone(self) !== "ex",
  abilities: [
    {
      ...atStartOfYourEndPhase({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "ex") yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        },
      }),
      validIn: ["ex"],
    },
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        yield* toExWithLhynkal(fx);
      },
    }),
  ],
});
