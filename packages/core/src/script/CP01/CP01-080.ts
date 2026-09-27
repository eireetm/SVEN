// CP01-080 Close-Knit Ambitions — Neutral spell, 10. ウマ娘.
// Shuffle your deck, then reveal the top 6 cards. You may put any number of Umamusume followers or Umamusume amulets from among
// them onto your field. Add the remaining cards to your hand. (Both kinds may be put there; their Fanfares are then ordered by
// the player — rulings. At most as many as the field holds; the rest go to the hand, CR 4.4.4.2.)
import { defineCard, spell } from "../helpers";
import { isAmulet, isFollower } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.shuffleDeck();
        const top = fx.topCards(6);
        if (top.length === 0) return;
        yield* fx.reveal(top);
        const room = Math.max(0, g.fieldLimit(fx.controller) - g.cards(fx.controller, "field").length);
        const fits = top.filter((id) => (isFollower(g, id) || isAmulet(g, id)) && umamusume(g, id));
        const chosen = yield* fx.chooseCards(fits, 0, Math.min(room, fits.length));
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
        yield* fx.returnToHand(top.filter((id) => g.card(id)?.zone === "deck"));
      },
    }),
  ],
});
