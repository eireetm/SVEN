// BP09-070 Vania, Kind Queen — Abysscraft follower, 4/4. 吸血鬼・プリンセス・光輝. The front face of a
// double-faced evolved card; its back face is BP09-070_back Vania, Blood Queen (CR 2.14).
// On Evolve - Draw a card. Discard a card.
// While this card is on your field, any Forest Bat you play costs 1 less.
// Whenever a Forest Bat is put onto your field, give your leader {[defense]}+1.
// (Two of them: 2 less and both trigger; two Bats at once trigger twice; also in the opponent's turn
// — rulings.)
import { defineCard, onEvolve, whenCardEntersYourField } from "../helpers";
import { forestBat, forestBatsCostLess } from "./shared";

export default defineCard({
  field: { playCostOf: forestBatsCostLess },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
        const n = Math.min(1, fx.game.cards(fx.controller, "hand").length);
        yield* fx.discard(fx.controller, n, n);
      },
    }),
    whenCardEntersYourField(
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { filter: forestBat },
    ),
  ],
});
