// BP19-024 Warden of Honor — Swordcraft follower, 4, 3/4. 八獄・指揮官.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Put the top card of your deck into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.topToEx(1);
      },
    }),
  ],
});
