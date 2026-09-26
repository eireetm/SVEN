// BP13-007 Spinaria, Keeper of the End — Forestcraft follower, 5, 3/3. 超克・キラー.
// Activate {[engage]}, banish 3 cards from your cemetery: Summon a Keenedge Artifact and a Mystic Artifact
// token. (With room for one, its controller chooses which — ruling.)
import { activated, defineCard } from "../helpers";
import { banishFromYour } from "../costs";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, custom: banishFromYour(["cemetery"], () => true, 3) },
      {
        *resolve(fx) {
          yield* fx.summon(["Keenedge Artifact", "Mystic Artifact"]);
        },
      },
    ),
  ],
});
