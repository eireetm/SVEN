// ECP01-057 Ryoka Tsurugi — Neutral follower, 6, 2/4. トレセン学園.
// {[fanfare]} You may summon an Umamusume follower from your hand and give it "At the start of your end phase, return this card to
// its owner's hand." (It keeps that ability when this leaves the field — ruling, CR 10.9.1.2.)
// At the start of your end phase, select your leader or an Umamusume follower on your field and give it {[defense]}+2.
import type { TargetSpec } from "../types";
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { maySummonFromHand, umamusume, umamusumeFollower } from "./shared";

const yourLeaderOrUmamusume: TargetSpec = {
  count: 1,
  candidates: (g, c) => [g.leader(c), ...g.followers(c).filter((id) => umamusume(g, id))],
};

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const summoned = yield* maySummonFromHand(fx, umamusumeFollower);
        for (const id of summoned) if (fx.game.card(id)?.zone === "field") yield* fx.grant(id, "returnToHandAtEnd");
      },
    }),
    atStartOfYourEndPhase({
      targets: [yourLeaderOrUmamusume],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (target === fx.game.leader(fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 2);
        else yield* fx.giveStats(target, 0, 2);
      },
    }),
  ],
});
