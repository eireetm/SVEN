// BP01-141 Holy Sentinel — Havencraft amulet, 5.
// Once on each of your turns, when another amulet you control leaves the field, summon a Holy
// Tiger token and give it Ward. (Only on your turn; each copy once per turn — rulings,
// CR 10.7.2.2.)
import { defineCard, whenAnotherAmuletLeaves } from "../helpers";

export default defineCard({
  abilities: [
    whenAnotherAmuletLeaves(
      {
        oncePerTurn: true,
        *resolve(fx) {
          for (const tiger of yield* fx.summon(["Holy Tiger"])) yield* fx.giveKeyword(tiger, "ward");
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
