// BP06-087 Rookie Succubus — Abysscraft follower, 2, 1/1. 魔界・吸血鬼.
// {[fanfare]}/{[lastwords]} Summon a Forest Bat token. (Two abilities, CR 12.4 / 12.5.)
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, lastWords } from "../helpers";

function* bat(fx: EffectContext) {
  yield* fx.summon(["Forest Bat"]);
}

export default defineCard({
  abilities: [fanfare({ resolve: bat }), lastWords({ resolve: bat })],
});
