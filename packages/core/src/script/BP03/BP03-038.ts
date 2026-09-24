// BP03-038 Wizardess of Oz — Runecraft follower, 6, 4/6. 魔法使い・童話.
// {[fanfare]} Summon a Magic Sediment. Add 1 to a Stack on your field. Draw a card.
// {[q]} Activate, Earth Rite: The next spell you play this turn costs 4 less. Once per turn.
// (A spell played by an effect consumes it — ruling. A cost set to 7 is then reduced by 4 — ruling.)
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
        yield* fx.addToStack(1);
        yield* fx.draw(1);
      },
    }),
    activated(
      {},
      {
        quick: true,
        oncePerTurn: true,
        earthRite: { mode: "required" },
        *resolve(fx) {
          yield* fx.nextSpellCostsLess(4);
        },
      },
    ),
  ],
});
