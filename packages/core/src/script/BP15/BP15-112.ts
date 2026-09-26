// BP15-112 Mjerrabaine, Great One — Neutral follower, 3, 4/4. 絶傑.
// {[fanfare]} Discard 3 cards: Put a Great Testimony token into your EX area. (CR 10.4.7.4.)
// Activate Banish a Mjerrabaine, Omen of One from your cemetery: Deal 2 damage to each enemy leader. Draw 2 cards.
// Activate only once per turn.
import { banishFromYour, discardCardsCost } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardCardsCost(3),
      *resolve(fx) {
        yield* fx.tokensToEx(["Great Testimony"]);
      },
    }),
    activated(
      { custom: banishFromYour(["cemetery"], named("Mjerrabaine, Omen of One")) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
          yield* fx.draw(2);
        },
      },
    ),
  ],
});
