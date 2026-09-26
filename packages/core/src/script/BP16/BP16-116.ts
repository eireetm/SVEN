// BP16-116 Alouette, Doomwright Ward — Neutral follower, 4, 3/3. 超克・光輝.
// {[fanfare]} Summon a Keenedge Artifact token.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Keenedge Artifact"]);
      },
    }),
  ],
});
