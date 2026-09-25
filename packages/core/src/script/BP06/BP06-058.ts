// BP06-058 Phoenix Empress — Dragoncraft follower, 5, 5/3. 不死鳥.
// Rush.
// {[lastwords]} Decrease your max play points by 1: Put this card onto its owner's field engaged.
// (Not with 0 max play points; play points above the new maximum come down with it — rulings,
// CR 11.9.)
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    lastWords({
      cost: {
        canPay: (g, c) => g.state.players[c].maxPlayPoints >= 1,
        *pay(fx) {
          yield* fx.increaseMaxPlayPoints(-1);
        },
      },
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putOntoField([fx.self], fx.game.card(fx.self)!.owner, { engaged: true });
      },
    }),
  ],
});
