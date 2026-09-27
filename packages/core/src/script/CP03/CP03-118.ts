// CP03-118 Oracle Guardian, Nike — Havencraft follower, 4, 4/4. ヴァンガード・オラクルシンクタンク. Critical Trigger.
// Rush. Assail.
// Whenever you drive check a Trigger, give this follower Storm. (Only a resolved Trigger — ruling.)
// ----------
// (If this card is revealed by a drive check, give a follower on your field {[attack]}+2.) (Resolved by the engine.)
import { defineCard, whenYouDriveCheckTrigger } from "../helpers";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    whenYouDriveCheckTrigger({
      *resolve(fx) {
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
