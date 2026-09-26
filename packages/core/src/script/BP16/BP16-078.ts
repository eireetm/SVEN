// BP16-078 Gold Rush Ghost — Abysscraft follower, 2, 2/2. 荒野・死者.
// Storm.
// {[fanfare]} Choose 1. If this was put onto the field from the cemetery, choose up to 2 instead. (1) Summon an Arcane
// Personnel Carrier token. Give your leader {[defense]}+1. (2) Bury the top 2 cards of your deck. (Each option once —
// ruling.)
// At the start of each opponent's end phase, bury this.
import { atStartOfOpponentsEndPhase, defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      modeCount: (g, _p, self) => (g.enteredFrom(self) === "cemetery" ? 2 : 1),
      modes: [
        {
          id: "carrier",
          label: "(1) An Arcane Personnel Carrier, leader +1",
          *resolve(fx) {
            yield* fx.summon(["Arcane Personnel Carrier"]);
            yield* fx.giveLeaderDefense(fx.controller, 1);
          },
        },
        {
          id: "bury",
          label: "(2) Bury the top 2 cards of your deck",
          *resolve(fx) {
            yield* fx.mill(2);
          },
        },
      ],
    }),
    atStartOfOpponentsEndPhase({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.bury([fx.self]);
      },
    }),
  ],
});
