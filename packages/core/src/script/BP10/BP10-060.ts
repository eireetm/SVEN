// BP10-060 Slaughtering Dragonewt — Dragoncraft follower, 3, 3/5. アルカナ・ドラゴニュート.
// {[evolve]} {[cost03]}: Evolve this follower.
// {[fanfare]} Banish the top 5 cards of your deck. (With fewer, those there are; not a draw, so no
// loss — ruling, CR 1.3.2.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(3),
    fanfare({
      *resolve(fx) {
        yield* fx.banish(fx.topCards(5));
      },
    }),
  ],
});
