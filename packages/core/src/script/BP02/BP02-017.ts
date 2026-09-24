// BP02-017 Rose Deer — Forestcraft follower, 4, 4/3.
// Rush. // {[fanfare]} Put a Thorn Burst token into your EX area.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Thorn Burst"]);
      },
    }),
  ],
});
