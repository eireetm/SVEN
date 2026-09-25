// BP06-102 Gravity Grappler — Havencraft follower, 3, 3/3. 信仰.
// At the start of your end phase, if you have at least 2 play points, summon a Mystic Artifact
// token. (Its Ward and Fanfare come before your Ward engaging and the quick window — ruling.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { playPointsOf } from "./shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (playPointsOf(fx.game, fx.controller) >= 2) yield* fx.summon(["Mystic Artifact"]);
      },
    }),
  ],
});
