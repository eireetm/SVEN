// BP18-039 Mana, Sterling Luster — Runecraft follower, 2, 2/2. 透京・錬金術師・商人.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select a card in your banished zone. Add it to your hand, then banish a card from your hand.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { inYourZone } from "../targets";
import { banishFromHand } from "./shared-rune";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [inYourZone("banished")],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
        yield* banishFromHand(fx, 1);
      },
    }),
  ],
});
