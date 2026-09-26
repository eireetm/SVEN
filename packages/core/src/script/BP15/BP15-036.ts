// BP15-036 Flying Messenger Squirrel — Swordcraft follower, 2, 2/3. 兵士・獣.
// {[fanfare]} If there's a Commander card on your field, draw a card.
import { defineCard, fanfare } from "../helpers";
import { commander, countIn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => countIn(g, p, "field", commander) > 0,
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
