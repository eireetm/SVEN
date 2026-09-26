// BP21-089 Serenading Succubus — Abysscraft follower, 6, 5/5. 魔界.
// At the start of your end phase, select up to 2 enemy followers on the field and engage them. They doesn't refresh during
// their controller's next start phase. Give your leader {[defense]}+3. (Engaged ones can be selected: the rest applies —
// ruling. The {[defense]}+3 comes with no follower selected too.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        const chosen = fx.targets[0] ?? [];
        if (chosen.length > 0) yield* fx.engage(chosen);
        for (const id of chosen) yield* fx.skipNextRefresh(id);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
