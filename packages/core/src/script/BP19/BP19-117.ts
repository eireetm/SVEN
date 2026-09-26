// BP19-117 Smeltwork Bodyguard — Neutral follower, 3, 3/3. 八獄・超克.
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
