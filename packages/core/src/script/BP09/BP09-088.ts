// BP09-088 Tutankhamun — Havencraft follower, 4, 5/4. 信仰・先導.
// Ward.
// {[fanfare]} Draw a card. Put a card from your hand on the bottom of your deck.
// {[lastwords]} {[cost01]}: Search your deck for a Tutankhamun, summon it engaged, then shuffle your
// deck. (CR 10.4.7.4: the player may pay as the Last Words resolves.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare, lastWords } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        const hand = fx.game.cards(fx.controller, "hand");
        if (hand.length === 0) return;
        yield* fx.putOnDeck(yield* fx.chooseCards(hand, 1, 1), "bottom");
      },
    }),
    lastWords({
      cost: playPointsCost(1),
      *resolve(fx) {
        yield* fx.search((id) => named("Tutankhamun")(fx.game, id), { to: "field", engaged: true });
      },
    }),
  ],
});
