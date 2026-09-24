// BP04-056 Starseer's Telescope — Runecraft amulet, 0. 魔法使い・土の印・星神.
// Stack.
// {[fanfare]} Look at the top card of your deck. (It stays where it was, face down — ruling.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.lookAt(fx.topCards(1));
      },
    }),
  ],
});
