// BP16-055 Truth Summons — Runecraft spell, 3. 錬金術師・ゴーレム.
// Earth Rite: Summon a Guardian Golem token. (Earth Rite is an additional cost the player may pay, and the text
// applies only if it was paid, CR 13.3.3.2: without a Stack card it can be played and does nothing.)
import { defineCard, spell } from "../helpers";
import { GUARDIAN_GOLEM } from "./shared";

export default defineCard({
  abilities: [
    spell({
      earthRite: { mode: "optional" },
      *resolve(fx) {
        if (fx.earthRitePaid) yield* fx.summon([GUARDIAN_GOLEM]);
      },
    }),
  ],
});
