// CP02-002 Aiko Takamori (Evolved) — 3/3.
// On Evolve - You may summon a Passion follower that costs 3 or less from your hand. (元のコスト, CR 5.24.1.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost } from "../targets";
import { followerThat, passion } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const fits = g.cards(fx.controller, "hand").filter((id) => followerThat(passion)(g, id) && costAtMost(3)(g, id));
        yield* fx.putOntoField(yield* fx.chooseCards(fits, 0, 1));
      },
    }),
  ],
});
