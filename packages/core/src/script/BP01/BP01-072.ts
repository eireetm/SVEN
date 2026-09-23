// BP01-072 Sorcery Cache — Runecraft spell, 2. {[quick]}
// Look at the top 4 cards of your deck. You may reveal a spell from among them and add it to your
// hand. You may also put a spell into your cemetery. Put the remaining cards on the bottom of your
// deck in any order. (Either, both or neither; with fewer cards look at all — rulings.)
import { defineCard, spell } from "../helpers";
import { isSpell } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(4);
        const spells = () => top.filter((id) => fx.game.card(id)?.zone === "deck" && isSpell(fx.game, id));
        const toHand = yield* fx.selectCards(spells(), 0, 1, fx.controller, top);
        yield* fx.reveal(toHand);
        yield* fx.returnToHand(toHand);
        const toCemetery = yield* fx.selectCards(spells(), 0, 1, fx.controller, top);
        yield* fx.bury(toCemetery);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
