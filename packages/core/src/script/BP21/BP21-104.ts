// BP21-104 Zlatorog — Havencraft follower, 5, 4/4. 光輝・獣.
// {[evolve]} {[cost02]}: Evolve this.
// Ward.
// {[fanfare]} Draw a card. If this wasn't put onto the field from hand, give it {[attack]}+2/{[defense]}+2. (From the EX
// area, the deck, the cemetery ... — ruling, CR 5.5.3.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        const g = fx.game;
        if (g.card(fx.self)?.zone === "field" && g.enteredFrom(fx.self) !== "hand") yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
