// BP21-067 Ipupiara — Dragoncraft follower, 3, 3/3. 海洋.
// {[evolve]} {[cost02]}: Evolve this.
// {[fanfare]} If this wasn't put onto the field from hand, evolve it. (From the EX area, the deck, the cemetery ... — ruling.
// Played from the hand, it was put onto the field from the hand, CR 5.5.3.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        if (g.card(fx.self)?.zone === "field" && g.enteredFrom(fx.self) !== "hand") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
