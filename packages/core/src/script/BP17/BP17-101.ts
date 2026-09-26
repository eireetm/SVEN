// BP17-101 Aerial Craft (Evolved) — 4/4.
// On Evolve - You may summon a Machina follower that costs 2 or less from your hand. (Original cost, 元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { smallMachinaFollower } from "./shared-haven";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const small = fx.game.cards(fx.controller, "hand").filter((id) => smallMachinaFollower(fx.game, id));
        yield* fx.putOntoField(yield* fx.chooseCards(small, 0, Math.min(1, small.length)));
      },
    }),
  ],
});
