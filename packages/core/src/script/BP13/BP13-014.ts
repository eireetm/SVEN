// BP13-014 Fairy Slugger (Evolved) — Forestcraft follower, 3/3. 妖精.
// On Evolve - Put a Fairy Wisp and Fairy token into your EX area. Then, if there are at least 3 Pixie
// followers in your EX area, give your leader {[defense]}+2. (With room for one, its controller chooses
// which — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { and, isFollower } from "../targets";
import { FAIRY, countIn, pixie } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy Wisp", FAIRY]);
        if (countIn(fx.game, fx.controller, "ex", and(isFollower, pixie)) >= 3) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
