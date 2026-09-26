// BP19-113 Zerael, Regent of Rebirth — Neutral follower, 7, 9/9. 八獄・大神.
// {[fanfare]} Reveal the top 9 cards of your deck, shuffle them, then put them on the bottom of your deck. If you revealed 9
// cards each with different names, bury this, and you may summon a Zerael, Regent of Vicissitude from your evolve deck.
// (With 8 cards in the deck, not — ruling. The official English text calls it "Regent of Transmigration"; it is BP19-114.)
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";

const vicissitude = named("Zerael, Regent of Vicissitude");

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(9);
        yield* fx.reveal(top);
        const names = new Set(top.map((id) => fx.game.info(id).name));
        yield* fx.shuffleToBottom(top);
        if (top.length < 9 || names.size < 9) return;
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.bury([fx.self]);
        yield* fx.fromEvolveDeck((id) => vicissitude(fx.game, id), { to: "field" });
      },
    }),
  ],
});
