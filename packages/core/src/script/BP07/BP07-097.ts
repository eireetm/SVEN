// BP07-097 Ironknuckle Nun — Havencraft follower, 2, 2/3. 機械・信仰.
// Ward.
// {[fanfare]}/{[lastwords]} Put a Repair Mode token into your EX area.
import { defineCard, fanfare, lastWords } from "../helpers";
import { REPAIR } from "./shared";

function* repairToEx(fx: import("../../engine/effects/context").EffectContext) {
  yield* fx.tokensToEx([REPAIR]);
}

export default defineCard({
  keywords: ["ward"],
  abilities: [fanfare({ resolve: repairToEx }), lastWords({ resolve: repairToEx })],
});
