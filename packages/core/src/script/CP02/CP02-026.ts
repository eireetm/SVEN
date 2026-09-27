// CP02-026 Karen Hojo — Swordcraft follower, 2, 1/1. デレマス・クール.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there are at least 3 iM@S CG followers on your field, give this follower {[defense]}+2. (This follower counts.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { followersOnYourField, imas } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, c) => followersOnYourField(g, c, imas) >= 3,
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 0, 2);
      },
    }),
  ],
});
