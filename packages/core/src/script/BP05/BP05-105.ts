// BP05-105 Gilnelise, Omen of Craving — Neutral follower, 4, 3/5. 絶傑.
// Drain.
// {[fanfare]} {[cost03]} Search your deck for an Apostle of Craving and Craving's Splendor, put them
// into your EX area, then shuffle your deck. (Either may be left unfound — ruling.)
// {[fanfare]} If each player has 10 maximum play points, draw 3 cards.
// Whenever you play a Neutral card, deal 1 damage to each enemy leader. (From any zone, tokens too;
// not for itself, evolving, or cards put onto the field; Drain doesn't heal from it — rulings.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { playPointsCost } from "../costs";
import { isClass, named } from "../targets";

export default defineCard({
  keywords: ["drain"],
  abilities: [
    fanfare({
      cost: playPointsCost(3),
      *resolve(fx) {
        yield* fx.searchEach(
          [(id) => named("Apostle of Craving")(fx.game, id), (id) => named("Craving's Splendor")(fx.game, id)],
          { to: "ex" },
        );
      },
    }),
    fanfare({
      *resolve(fx) {
        const players = [fx.controller, fx.game.opponent(fx.controller)];
        if (players.every((p) => fx.game.state.players[p].maxPlayPoints === 10)) yield* fx.draw(3);
      },
    }),
    whenYouPlay(
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        },
      },
      isClass("Neutral"),
    ),
  ],
});
