// CP01-042 Oguri Cap — Dragoncraft follower, 6, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// {[feed]}{[feed]} {[cost02]}: Race this follower 2 times.
// {[feed]}{[feed]}{[feed]} {[cost03]}: Race this follower 3 times.
// On Race: Give this follower {[attack]}+2/{[defense]}+1.
// {[fanfare]} Discard 2 cards: Give this follower Storm.
// Strike: Deal 3 damage to each enemy follower on the field.
// (Racing 3 times needs 3 Carrots; racing 2 times triggers On Race twice; once it raced it can't serve again — rulings.)
import { discardCardsCost } from "../costs";
import { defineCard, fanfare, onRace, serveAbility, strike } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    serveAbility(2, 2),
    serveAbility(3, 3),
    onRace({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 1);
      },
    }),
    fanfare({
      cost: discardCardsCost(2),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
    strike({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 3);
      },
    }),
  ],
});
