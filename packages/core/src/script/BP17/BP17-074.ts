// BP17-074 Urias, Final Vampire — Abysscraft follower, 3, 3/3. 吸血鬼.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put an A Horrible Night token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["A Horrible Night"]);
      },
    }),
  ],
});
