// SP01-045 Alice, Golden Afternoon — Neutral follower, 2, 2/3. 童話.
// {[fanfare]} Draw a card.
// {[fanfare]} Select an enemy follower that costs 4 or less on the field. If this card wasn't put onto the field from hand, put the
// selected follower into its owner's EX area. (元のコスト, an evolved follower's is its base card's; it loses damage and effects; an
// advanced card or a token stays in the EX area; with a full EX area it stays on the field; the two Fanfares resolve in any order —
// rulings.)
import { defineCard, fanfare } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    fanfare({
      targets: [enemyFollower({ filter: costAtMost(4) })],
      *resolve(fx) {
        const from = fx.game.enteredFrom(fx.self);
        if (from !== undefined && from !== "hand") yield* fx.putIntoEx(fx.targets[0]!);
      },
    }),
  ],
});
