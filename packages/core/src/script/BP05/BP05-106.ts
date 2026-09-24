// BP05-106 Apostle of Craving — Neutral follower, 3, 2/2. 絶傑.
// If there is a Gilnelise, Omen of Craving on your field, this card costs 3 less to play from the EX
// area.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select another follower on your field and give it Rush.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";
import { cravingDiscount } from "./shared";

export default defineCard({
  playCost: cravingDiscount,
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [anotherYourFollower()],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, "rush");
      },
    }),
  ],
});
