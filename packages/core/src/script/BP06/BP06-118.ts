// BP06-118 Sweet-Tooth Sleuth — Neutral follower, 3, 3/4. 探偵.
// {[fanfare]} Select an opponent. They reveal their hand. (Hidden again once the ability has
// resolved — ruling, CR 5.21.1.1.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.reveal(fx.game.cards(fx.game.opponent(fx.controller), "hand"));
      },
    }),
  ],
});
