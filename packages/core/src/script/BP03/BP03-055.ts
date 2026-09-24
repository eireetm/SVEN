// BP03-055 Jabberwock — Dragoncraft follower, 7, 7/7. 竜族・童話.
// {[fanfare]} Bury another follower on your field: Reveal from the top until you reveal a follower
// costing more than the buried one, and put it onto your field. Shuffle the other revealed cards
// onto the bottom. If none appears, shuffle every revealed card back and put nothing (ruling).
// An evolved follower's cost is its base cost (ruling, CR 5.16.1.2).
import { defineCard, fanfare } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: {
        canPay: (g, c, self) => g.followers(c).some((id) => id !== self),
        *pay(fx) {
          const cards = fx.game.followers(fx.controller).filter((id) => id !== fx.self);
          const [id] = yield* fx.chooseCards(cards, 1, 1);
          if (!id) return;
          fx.memory.cost = fx.game.info(id).cost ?? 0;
          yield* fx.bury([id]);
        },
      },
      *resolve(fx) {
        const limit = Number(fx.memory.cost ?? 0);
        const deck = fx.game.cards(fx.controller, "deck");
        let idx = -1;
        for (let i = 0; i < deck.length; i++) {
          const id = deck[i]!;
          if (isFollower(fx.game, id) && (fx.game.info(id).cost ?? 0) > limit) {
            idx = i;
            break;
          }
        }
        if (idx < 0) {
          if (deck.length > 0) yield* fx.reveal(deck);
          yield* fx.shuffleDeck();
          return;
        }
        const before = deck.slice(0, idx);
        const match = deck[idx]!;
        yield* fx.reveal(deck.slice(0, idx + 1));
        const entered = yield* fx.putOntoField([match]);
        yield* fx.shuffleToBottom(entered.length === 0 ? [match, ...before] : before);
      },
    }),
  ],
});
