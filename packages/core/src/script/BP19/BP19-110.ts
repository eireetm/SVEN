// BP19-110 Cutthroat, Discord Convict — Neutral follower, 1, 1/1. 八獄・超克.
// {[evolve]} {[cost04]}: Evolve this follower.
// {[fanfare]} Look at the top 8 cards of your deck. Add one of them to your hand. Shuffle the rest and put them on the bottom
// of your deck. (Not revealed — the Japanese, Chinese and official English texts.)
// ---------
// Your main deck and evolve deck cannot contain more than 1 of any card, except those with "Cutthroat" in their name.
// (CR 6.1.2; while this is in the main deck, per deck; cards with "Cutthroat" in their name keep the limit of 3 — rulings.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  restrictsDeck: { copies: 1, exempt: (def) => def.name.includes("Cutthroat") },
  abilities: [
    evolveAbility(4),
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(8);
        if (top.length === 0) return;
        const picked = yield* fx.selectCards(top, 1, 1, fx.controller, top);
        yield* fx.returnToHand(picked);
        yield* fx.shuffleToBottom(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
