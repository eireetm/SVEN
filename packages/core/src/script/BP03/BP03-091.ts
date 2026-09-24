// BP03-091 Diamond Master — Havencraft follower, 4, 2/5. 信仰.
// {[evolve]} {[cost03]}: Evolve.
// {[fanfare]} Choose: (1) Gain Storm. (2) Gain Ward.
// Whenever an opponent is selecting cards for an ability, if they can select this card, they must
// (CR 1.3.2.3). Not attacks, discards, or EX banishes (rulings). Aura removes it from the
// selection, so the requirement does not apply (ruling).
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  mustBeSelected: true,
  abilities: [
    evolveAbility(3),
    fanfare({
      modes: [
        {
          id: "storm",
          label: "Gain Storm",
          *resolve(fx) {
            yield* fx.giveKeyword(fx.self, "storm");
          },
        },
        {
          id: "ward",
          label: "Gain Ward",
          *resolve(fx) {
            yield* fx.giveKeyword(fx.self, "ward");
          },
        },
      ],
    }),
  ],
});
