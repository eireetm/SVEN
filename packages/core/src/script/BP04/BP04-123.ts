// BP04-123 Purehearted Singer — Neutral follower, 3, 1/2. シンガー.
// {[fanfare]}/{[lastwords]} Draw a card.
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, lastWords } from "../helpers";

function* drawOne(fx: EffectContext) {
  yield* fx.draw(1);
}

export default defineCard({ abilities: [fanfare({ resolve: drawOne }), lastWords({ resolve: drawOne })] });
