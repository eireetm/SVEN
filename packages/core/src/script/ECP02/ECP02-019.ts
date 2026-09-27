// ECP02-019 Mayu Sakuma [Love-Laden Gift] — Swordcraft follower, 3, 3/3. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Each player draws a card. (Also when a deck is empty: that player loses — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.draw(1, fx.game.opponent(fx.controller));
      },
    }),
  ],
});
