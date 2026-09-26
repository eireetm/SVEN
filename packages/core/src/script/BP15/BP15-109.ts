// BP15-109 Hardplume Warrior — Havencraft follower, 2, 2/2. 信仰・鳥族.
// Ward.
// {[fanfare]} Select another {[havencraft]} follower on your field with Ward and, if there are at least 3 followers on
// your field with Ward, give it Storm. (This one counts.)
import { defineCard, fanfare } from "../helpers";
import { and, anotherYourFollower, isClass } from "../targets";
import { wardFollower, wardFollowersOnField } from "./shared-haven";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: and(isClass("Havencraft"), wardFollower) })],
      *resolve(fx) {
        if (wardFollowersOnField(fx.game, fx.controller) >= 3) yield* fx.giveKeyword(fx.targets[0]![0]!, "storm");
      },
    }),
  ],
});
