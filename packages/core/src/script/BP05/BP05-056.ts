// BP05-056 Apostle of Disdain (Evolved) — Dragoncraft follower, 3/5. 絶傑・竜族.
// On Evolve, discard a card: Look at the top 5 cards of your deck. From among them, you may reveal
// up to 2 Omen cards and add them to your hand. Put the remaining cards on the bottom of your deck
// in any order.
// During your turn, whenever this follower takes ability damage, give it {[attack]}+1 and Storm.
import { defineCard, onEvolve } from "../helpers";
import { discardCardsCost } from "../costs";
import { hasTrait } from "../targets";
import { disdainfulRage } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardCardsCost(1),
      *resolve(fx) {
        const top = fx.topCards(5);
        const omens = top.filter((id) => hasTrait("絶傑")(fx.game, id));
        const chosen = yield* fx.selectCards(omens, 0, 2, fx.controller, top);
        yield* fx.reveal(chosen);
        yield* fx.returnToHand(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
    disdainfulRage,
  ],
});
