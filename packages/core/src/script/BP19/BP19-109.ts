// BP19-109 Holybeast Ruins — Havencraft amulet, 4. 信仰・偶像.
// {[fanfare]}/{[lastwords]} Summon a Holy Tiger token.
import { defineCard, fanfare, lastWords } from "../helpers";
import { HOLY_TIGER } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([HOLY_TIGER]);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.summon([HOLY_TIGER]);
      },
    }),
  ],
});
