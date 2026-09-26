// BP13-109 Miriam, Mutinous Being (Evolved) — Neutral follower, 4/4. 超克・キラー.
// On Evolve - Bury another follower: Summon a Keenedge Artifact token. (A follower on your field, CR 10.4.3.)
// During your turn, whenever a follower is put from your field into the cemetery, deal 1 damage to each
// enemy leader.
import { buryAnotherFromYourField } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { isFollower } from "../targets";
import { miriamBurn } from "./shared-neutral";

export default defineCard({
  abilities: [
    onEvolve({
      cost: buryAnotherFromYourField(isFollower),
      *resolve(fx) {
        yield* fx.summon(["Keenedge Artifact"]);
      },
    }),
    miriamBurn,
  ],
});
