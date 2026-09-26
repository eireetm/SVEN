// BP21-094 Wilbert, Desolate Paladin — Havencraft follower, 3, 2/2. 挑戦者・先導.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Summon a Holy Cavalier token.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Holy Cavalier"]);
      },
    }),
  ],
});
