// BP18-T10 Bansai Suzuki, Clone Technique — Neutral follower token, 6, 5/5. 透京・区役所.
// Rush. Assail. Ward.
// At the start of your end phase, summon a Bansai Suzuki, Clone Technique token. (One summoned at that time doesn't trigger
// that end phase — ruling, CR 10.7.2.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  keywords: ["rush", "assail", "ward"],
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.summon(["Bansai Suzuki, Clone Technique"]);
      },
    }),
  ],
});
