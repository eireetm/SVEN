// BP12-021 Ironfist Beast Warrior — Swordcraft follower, 5, 4/6. 指揮官・獣.
// When this card is discarded, you may put it into your EX area.
// ----------
// {[evolve]} {[cost03]}: Evolve this follower.
// Ward.
// {[fanfare]} Put the top card of your deck into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { discardedToEx } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    discardedToEx,
    evolveAbility(3),
    fanfare({
      *resolve(fx) {
        yield* fx.topToEx(1);
      },
    }),
  ],
});
