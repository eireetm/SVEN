// BP10-047 Rite of the Ignorant — Runecraft spell, 1. アルカナ・魔法使い・光輝.
// This card can't be played from the EX area.
// At the start of your end phase, if this card is in your EX area, draw a card, then discard a card.
// (Valid in the EX area, CR 10.3.5; each copy triggers; playing it is not playing a spell — rulings.)
// ----------
// Give your leader {[defense]}+2. If there's a 0. Lhynkal, The Fool on your field, put this card into
// its owner's EX area.
import { atStartOfYourEndPhase, defineCard, spell } from "../helpers";
import { toExWithLhynkal } from "./shared";

export default defineCard({
  playableIf: (g, self) => g.playZone(self) !== "ex",
  abilities: [
    {
      ...atStartOfYourEndPhase({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "ex") return;
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
        },
      }),
      validIn: ["ex"],
    },
    spell({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* toExWithLhynkal(fx);
      },
    }),
  ],
});
