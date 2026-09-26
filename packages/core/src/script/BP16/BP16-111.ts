// BP16-111 Olivia, Heroic Dark Angel — Neutral follower, 5, 4/4. 堕天使.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
