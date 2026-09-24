// BP04-064 Star Phoenix — Dragoncraft follower, 3, 2/2. 不死鳥・星神.
// {[evolve]} {[cost01]}: Evolve this follower.
// During your turn, when you play a Dragoncraft spell, {[cost01]}: Put this card from your
// cemetery onto your field.
// Valid only in the cemetery; each copy there triggers; a Phoenix the spell itself destroys was
// not in the cemetery when the spell was played (rulings).
import { defineCard, evolveAbility } from "../helpers";
import { playPointsCost } from "../costs";

export default defineCard({
  abilities: [
    evolveAbility(1),
    {
      kind: "automatic",
      timing: "other",
      validIn: ["cemetery"],
      trigger: (e, me, game) =>
        !me.lookBack &&
        e.type === "cardPlayed" &&
        e.player === me.controller &&
        game.activePlayer === me.controller &&
        game.info(e.card).type === "spell" &&
        game.info(e.card).class === "Dragoncraft",
      cost: playPointsCost(1),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putOntoField([fx.self]);
      },
    },
  ],
});
