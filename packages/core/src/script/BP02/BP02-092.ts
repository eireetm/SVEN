// BP02-092 Kaguya — Havencraft follower, 5, 4/4.
// {[evolve]}{[cost02]}: Evolve this follower.
// {[fanfare]} Select an amulet that costs 3 play points or less in your hand and put it onto your
// field. (The hand is non-public: putting none is allowed — ruling, CR 4.1.2.2.)
// Whenever an amulet is put onto your field, select an enemy follower on the field and deal it X
// damage. X equals the amulet's cost. (Once per amulet, also when two enter together — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { and, costAtMost, inYourZone, isAmulet } from "../targets";
import { amuletEntersDamage } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      targets: [inYourZone("hand", { filter: and(isAmulet, costAtMost(3)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
    amuletEntersDamage,
  ],
});
