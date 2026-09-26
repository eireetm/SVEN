// BP16-044 Juno, Visionary Alchemist — Runecraft follower, 6, 3/3. 錬金術師.
// Activate {[engage]} this, Earth Rite: Summon 2 Guardian Golem tokens.
// {[act]} {[cost02]}, discard this: Add 2 to a Stack on your field. Draw a card. (Valid in the hand; with no Stack
// card, a Magic Sediment with 2 Stack counters — rulings.)
import { discardThis } from "../costs";
import { activated, defineCard } from "../helpers";
import { GUARDIAN_GOLEM } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        earthRite: { mode: "required" },
        *resolve(fx) {
          yield* fx.summon([GUARDIAN_GOLEM, GUARDIAN_GOLEM]);
        },
      },
    ),
    activated(
      { playPoints: 2, custom: discardThis },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.addToStack(2);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
