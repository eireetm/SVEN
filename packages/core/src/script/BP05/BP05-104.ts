// BP05-104 Mjerrabaine, Omen of One (Evolved) — Neutral follower, 6/6. 絶傑.
// At the start of your end phase, refresh this card and, if there are 2 cards or less in your hand,
// deal 5 damage to each enemy leader. If there are 0 cards in your hand, deal 5 damage to each
// enemy follower on the field.
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { mjerrabaineStrikes } from "./shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.refresh([fx.self]);
        yield* mjerrabaineStrikes(fx, 5);
      },
    }),
  ],
});
