// BP18-096 Nightscreech — Abysscraft spell, 1. 吸血鬼.
// Look at the top card of your deck. If it's a Vampire card, you may reveal it and add it to your hand. Summon a Forest Bat
// token. If there are at least 5 Vampire cards in your cemetery, give it {[attack]}+2. Rush and Assail.
// (A card not taken stays on top, unrevealed — ruling. The Japanese text puts Rush and Assail with the {[attack]}+2 under the
// condition.)
import { defineCard, spell } from "../helpers";
import { FOREST_BAT, vampire } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(1);
        const chosen = yield* fx.selectCards(top.filter((id) => vampire(fx.game, id)), 0, 1, fx.controller, top);
        if (chosen.length > 0) {
          yield* fx.reveal(chosen);
          yield* fx.returnToHand(chosen);
        }
        const bats = yield* fx.summon([FOREST_BAT]);
        if (fx.game.cards(fx.controller, "cemetery").filter((id) => vampire(fx.game, id)).length < 5) return;
        for (const bat of bats) {
          if (fx.game.card(bat)?.zone !== "field") continue;
          yield* fx.giveStats(bat, 2, 0);
          yield* fx.giveKeyword(bat, "rush");
          yield* fx.giveKeyword(bat, "assail");
        }
      },
    }),
  ],
});
