// ECP01-022 Narita Top Road [Peachy Silhouette] — Runecraft follower, 5, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// Storm.
// On Race - Give this follower {[attack]}+1/{[defense]}+1.
// Strike - Banish 3 Umamusume followers with Storm from your cemetery: Deal each enemy follower on the field damage equal to this
// follower's attack. (In the cemetery a card has its printed Storm only: Air Shakur's "while ..." isn't valid there — ruling.)
import { banishFromYour } from "../costs";
import { defineCard, onRace, serveAbility, strike } from "../helpers";
import { plusOneThis, umamusumeFollower } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        yield* plusOneThis(fx);
      },
    }),
    strike({
      cost: banishFromYour(["cemetery"], (g, id) => umamusumeFollower(g, id) && g.hasKeyword(id, "storm"), 3),
      *resolve(fx) {
        const g = fx.game;
        if (g.card(fx.self)?.zone !== "field") return;
        yield* fx.dealDamageEach(g.followers(g.opponent(fx.controller)), Math.max(0, g.statsOf(fx.self).attack ?? 0));
      },
    }),
  ],
});
