// BP17-052 Jetbroom Witch — Runecraft follower, 1, 1/3. 機械・魔法使い.
// Ward.
// {[fanfare]} Put a Repair Mode token into your EX area.
import { defineCard, fanfare } from "../helpers";
import { REPAIR } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
  ],
});
