// BP14-112 Gunslinger Automaton — Neutral follower, 3, 2/2. 傭兵・超克.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put the top card of your deck into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.topToEx(1);
      },
    }),
  ],
});
