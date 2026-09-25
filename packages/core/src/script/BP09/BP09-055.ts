// BP09-055 Lindworm — Dragoncraft follower, 10, 10/10. 竜族.
// {[evolve]} {[cost05]}: Evolve this follower into a Virtuous Lindworm or Iniquitous Lindworm. (Either
// face of the double-faced BP09-056 — ruling, CR 4.6.4.)
// {[fanfare]} Recover play points equal to the number of {[dragoncraft]} spells in your cemetery.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { countIn, dragonSpell } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(5, { into: ["Virtuous Lindworm", "Iniquitous Lindworm"] }),
    fanfare({
      *resolve(fx) {
        yield* fx.recoverPlayPoints(countIn(fx.game, fx.controller, "cemetery", dragonSpell));
      },
    }),
  ],
});
