// BP15-032 Penguin Guardian — Swordcraft follower, 1, 1/3. 兵士・獣.
// {[evolve]} {[cost03]}: Evolve this.
// Ward.
// {[fanfare]} {[cost03]} Give this {[attack]}+2/{[defense]}+2.
import { playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(3),
    fanfare({
      cost: playPointsCost(3),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
