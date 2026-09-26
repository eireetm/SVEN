// BP17-104 Steelwing — Havencraft follower, 7, 4/5. 機械・信仰・鳥族.
// {[evolve]} {[cost01]}: Evolve this.
// Storm.
// {[fanfare]} Summon 2 Assembly Droid tokens.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { DROID } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([DROID, DROID]);
      },
    }),
  ],
});
