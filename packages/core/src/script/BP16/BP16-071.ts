// BP16-071 Zell, Windreader — Dragoncraft follower, 3, 3/3. 竜使い.
// {[fanfare]} Select a {[dragoncraft]} follower on your field and, if you have 10 max play points, give it Storm.
// (This one may be selected.)
import { defineCard, fanfare } from "../helpers";
import { isClass, yourFollower } from "../targets";
import { tenMaxPlayPoints } from "./shared-dragon";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower({ filter: isClass("Dragoncraft") })],
      *resolve(fx) {
        if (tenMaxPlayPoints(fx.game, fx.controller)) yield* fx.giveKeyword(fx.targets[0]![0]!, "storm");
      },
    }),
  ],
});
