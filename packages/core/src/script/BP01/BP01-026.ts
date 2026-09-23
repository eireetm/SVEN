// BP01-026 Sea Queen Otohime — Swordcraft follower, 4, 3/4.
// {[evolve]}{[cost02]}: Evolve this follower. // {[fanfare]} Summon an Otohime's Bodyguard token.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Otohime's Bodyguard"]);
      },
    }),
  ],
});
