// CP03-005 Marine General of the Restless Tides, Algos — Forestcraft follower, 2, 1/3. ヴァンガード・アクアフォース.
// {[evolve]} {[cost01]}: Evolve this follower into a Navalgazer Dragon.
// Whenever an Aqua Force follower on your field attacks, if it's the 3rd time an Aqua Force follower on your field has attacked
// this turn, give your leader {[defense]}+2 and draw a card.
import { defineCard, evolveAbility, whenYourFollowerAttacks } from "../helpers";
import { aquaForce, aquaForceAttacks } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1, { into: ["Navalgazer Dragon"] }),
    // Once per attack; each copy triggers; exactly the 3rd attack, this one included (rulings).
    whenYourFollowerAttacks(
      {
        condition: (g, c) => aquaForceAttacks(g, c) === 3,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
          yield* fx.draw(1);
        },
      },
      aquaForce,
    ),
  ],
});
