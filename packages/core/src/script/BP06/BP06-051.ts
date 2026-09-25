// BP06-051 Passionate Potioneer — Runecraft follower, 2, 2/3. 錬金術師.
// {[fanfare]}/{[lastwords]} Summon a Magic Sediment token. (Two abilities, CR 12.4 / 12.5.)
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, lastWords } from "../helpers";

function* sediment(fx: EffectContext) {
  yield* fx.summon(["Magic Sediment"]);
}

export default defineCard({
  abilities: [fanfare({ resolve: sediment }), lastWords({ resolve: sediment })],
});
