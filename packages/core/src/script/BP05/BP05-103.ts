// BP05-103 Mjerrabaine, Omen of One — Neutral follower, 5, 5/5. 絶傑.
// {[evolve]} {[cost01]}: Evolve this follower.
// Rush.
// At the start of your end phase, if there are 2 cards or less in your hand, deal 3 damage to each
// enemy leader. If there are 0 cards in your hand, deal 3 damage to each enemy follower on the
// field.
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";
import { mjerrabaineStrikes } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    evolveAbility(1),
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* mjerrabaineStrikes(fx, 3);
      },
    }),
  ],
});
