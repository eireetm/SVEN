// BP07-090 Marlone, Light of Balance — Havencraft follower, 3, 3/3. 信仰.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Each player puts a Repair Mode token into their EX area. (The turn player first, CR
// 1.3.4.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { REPAIR } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const first = fx.game.activePlayer;
        for (const p of [first, fx.game.opponent(first)]) yield* fx.tokensToEx([REPAIR], p);
      },
    }),
  ],
});
