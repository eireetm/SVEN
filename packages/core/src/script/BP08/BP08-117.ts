// BP08-117 Happy Pig — Neutral follower, 2, 2/3. 獣.
// Fanfare / Last Words: give your leader +1 defense. CR 5.27, 12.4, 12.5.
import { defineCard, fanfare, lastWords } from "../helpers";

const heal = { *resolve(fx: Parameters<NonNullable<Parameters<typeof fanfare>[0]["resolve"]>>[0]) {
  yield* fx.giveLeaderDefense(fx.controller, 1);
} };

export default defineCard({ abilities: [fanfare(heal), lastWords(heal)] });
