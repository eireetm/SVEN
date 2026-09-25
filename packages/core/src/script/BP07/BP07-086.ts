// BP07-086 Limonia, Flawed Saint — Havencraft follower, 3, 3/2. 機械・信仰・狂信・偶像.
// {[evolve]} {[cost07]}: Evolve this follower.
// {[fanfare]} Put a Repair Mode token into your EX area.
// Activate Banish a Repair Mode from your EX area: This card's Evolve costs 1 less this turn.
// (Each activation lowers it by 1; it can go below 0, so 8 activations make it free — rulings.)
import { banishFromYourEx } from "../costs";
import { activated, defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";
import { REPAIR } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(7),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
    activated(
      { custom: banishFromYourEx(named(REPAIR)) },
      {
        *resolve(fx) {
          yield* fx.changeEvolveCost(fx.self, -1, "endOfTurn");
        },
      },
    ),
  ],
});
