// SP01-039 Zoe, Shore's Melody — Havencraft follower, 1, 0/1. 信仰・プリンセス.
// {[fanfare]} Select an enemy follower on the field. If your leader has gained at least 4 defense this turn, destroy it and draw a card.
// (The total gained this turn: +1 and +3 count, so does -3 changed to 1, and later damage doesn't matter; not played without a follower
// to select, and no draw without the condition — rulings.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.leaderDefenseGainedTotalThisTurn(fx.controller) < 4) return;
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.draw(1);
      },
    }),
  ],
});
