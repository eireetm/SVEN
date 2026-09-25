// BP09-027 Queen Hemera the White — Swordcraft follower, 3, 4/3. 指揮官・童話・光輝.
// Rush.
// {[fanfare]} Summon a Knight token. If there's a Queen Magnus the Black on your field, summon 2
// instead.
// Strike - Put a Knight token into your EX area.
import { defineCard, fanfare, strike } from "../helpers";
import { onYourField } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(onYourField(fx.game, fx.controller, "Queen Magnus the Black") ? ["Knight", "Knight"] : ["Knight"]);
      },
    }),
    strike({
      *resolve(fx) {
        yield* fx.tokensToEx(["Knight"]);
      },
    }),
  ],
});
