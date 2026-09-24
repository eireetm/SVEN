// BP03-064 Hammer Dragonewt — Dragoncraft follower, 2, 2/2. ドラゴニュート・竜族・武装.
// {[evolve]} {[cost01]}: Evolve.
// {[fanfare]} Look at the top 4. You may reveal an Armed spell and add it to your hand. Rest on the bottom.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { hasTrait, isSpell } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(4);
        const matching = top.filter((id) => isSpell(fx.game, id) && hasTrait("武装")(fx.game, id));
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
