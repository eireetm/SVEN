// SD01-005 Waltzing Fairy — Forestcraft follower, 3, 3/3. 妖精.
// {[fanfare]}/{[lastwords]} Put a Fairy token into your EX area. (Nothing when it is full — ruling.)
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, lastWords } from "../helpers";
import { FAIRY } from "../BP13/shared";

function* fairyToEx(fx: EffectContext) {
  yield* fx.tokensToEx([FAIRY]);
}

export default defineCard({ abilities: [fanfare({ resolve: fairyToEx }), lastWords({ resolve: fairyToEx })] });
