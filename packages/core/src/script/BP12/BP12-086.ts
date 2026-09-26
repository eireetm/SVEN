// BP12-086 Rola, Inferno Dragoon — Havencraft follower, 2, 2/2. 機械・信仰・偶像.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Put a Repair Mode token into your EX area. If this card was put onto the field by an
// ability, evolve it. (Also during the opponent's turn; not counted as the turn's evolve — rulings.)
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";
import { REPAIR } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
        if (enteredByAbility(fx) && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
