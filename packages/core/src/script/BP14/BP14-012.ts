// BP14-012 Karakuri Servant — Forestcraft follower, 2, 2/2. 宴楽・人形・超克.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Puppet token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { PUPPET } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([PUPPET]);
      },
    }),
  ],
});
