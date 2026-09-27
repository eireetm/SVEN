// CP04-T12 Glorious Feather — Havencraft equipment token, 2. プリコネ・サレンディア救護院.
// The equipped follower has "At the start of your end phase, give your leader {[defense]}+3." (The follower's ability: lost with its
// abilities — ruling.)
// If the equipped follower would deal damage, it deals that much +1 instead. (The token's own: it stays — ruling. Combat and
// ability damage; the player taking it orders it with other changes, CR 10.10.2.)
// (Place this beneath the equipped follower.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  equipment: {
    abilities: [
      atStartOfYourEndPhase({
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 3);
        },
      }),
    ],
  },
  field: {
    damageBy: (g, self, d) => (d.source !== null && d.source === g.equippedFollower(self) ? 1 : 0),
  },
});
