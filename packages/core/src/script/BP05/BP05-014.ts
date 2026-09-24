// BP05-014 Flower Doll — Forestcraft follower, 2, 2/2. 人形・植物族.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Put a Puppet token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Puppet"]);
      },
    }),
  ],
});
