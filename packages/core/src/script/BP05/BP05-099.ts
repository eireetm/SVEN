// BP05-099 Demon's Epitaph (Evolved) — Havencraft follower, 3/4. 偶像・超克.
// Bane.
// {[lastwords]} Deal 2 damage to each enemy leader.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
