// BP01-101 Cerberus — Abysscraft follower, 4, 3/3.
// {[evolve]}{[cost02]}: Evolve this follower.
// {[fanfare]} Put a Mimi, Infernal Right Paw or Coco, Infernal Left Paw token into your EX area.
// Necrocharge (10) - Put both instead. (With 1 EX slot left the player picks — ruling; CR 13.5.1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        if (fx.game.necrocharge(fx.controller, 10)) {
          yield* fx.tokensToEx(["Mimi", "Coco"]);
          return;
        }
        const [paw] = yield* fx.choose([
          { id: "Mimi", label: "Mimi, Infernal Right Paw" },
          { id: "Coco", label: "Coco, Infernal Left Paw" },
        ]);
        yield* fx.tokensToEx([paw!]);
      },
    }),
  ],
});
