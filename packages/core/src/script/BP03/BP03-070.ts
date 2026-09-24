// BP03-070 Dragon Summoner (Evolved) — Dragoncraft, 2/4.
// On Evolve: Look at the top 3. You may reveal a Dragoncraft follower and add it to your hand.
// Put the rest on the bottom.
import { defineCard, onEvolve } from "../helpers";
import { isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const top = fx.topCards(3);
        const matching = top.filter((id) => isFollower(fx.game, id) && isClass("Dragoncraft")(fx.game, id));
        const [chosen] = yield* fx.selectCards(matching, 0, 1, fx.controller, top);
        if (chosen) {
          yield* fx.reveal([chosen]);
          yield* fx.returnToHand([chosen]);
        }
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
