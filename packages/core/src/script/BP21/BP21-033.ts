// BP21-033 Fervent Fist-Fighter — Swordcraft follower, 1, 2/1. 兵士・学院.
// Rush.
// {[fanfare]} If this was put onto the field by an ability, give it {[attack]}+2 and Assail. (On the opponent's turn too —
// ruling.)
import { defineCard, enteredByAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field" || !enteredByAbility(fx)) return;
        yield* fx.giveStats(fx.self, 2, 0);
        yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
  ],
});
