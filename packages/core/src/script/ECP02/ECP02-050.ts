// ECP02-050 Nono Morikubo [individuals] — Abysscraft follower, 2, 1/1. デレマス・クール.
// {[evolve]} {[cost01]}: Evolve this.
// Whenever a follower with "Mirei Hayasaka" or "Syoko Hoshi" in its name is put onto your field, give it {[attack]}+1/{[defense]}+1.
// (On the opponent's turn too — ruling.)
import { defineCard, evolveAbility, whenFollowerEntersYourField } from "../helpers";
import { followerNamed } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const card = fx.data?.card;
          if (card !== undefined && fx.game.card(card)?.zone === "field") yield* fx.giveStats(card, 1, 1);
        },
      },
      { filter: followerNamed("Mirei Hayasaka", "Syoko Hoshi") },
    ),
  ],
});
