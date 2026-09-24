// BP05-092 Ancient Protector — Havencraft amulet, 3. 偶像・光輝.
// While this card is on your field, you can't lose the game, and opponents can't win.
// When your leader's defense becomes 0 or less, put this card into its owner's cemetery and change
// your leader's defense to 1.
// Rulings: the prohibition wins over "you win the game" (CR 1.3.3); drawing from an empty deck
// doesn't lose; conceding still does; two of them both go to the cemetery.
import { defineCard, whenYourLeaderDefenseDropsToZero } from "../helpers";

export default defineCard({
  field: { cantLose: true },
  abilities: [
    whenYourLeaderDefenseDropsToZero({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.bury([fx.self]);
        yield* fx.setLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
