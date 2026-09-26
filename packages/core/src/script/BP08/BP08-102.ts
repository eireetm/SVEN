// BP08-102 Forgotten Sanctuary — Havencraft amulet, 3. 信仰・偶像.
// Fanfare: summon a Holy Tiger token. Last Words: give your leader +2 defense. CR 5.5, 12.4, 12.5.
import { defineCard, fanfare, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({ *resolve(fx) { yield* fx.summon(["Holy Tiger"]); } }),
    lastWords({ *resolve(fx) { yield* fx.giveLeaderDefense(fx.controller, 2); } }),
  ],
});
