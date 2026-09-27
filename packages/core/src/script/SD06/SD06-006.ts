// SD06-006 Dual Flames — Havencraft amulet, 4. 信仰・獣.
// {[fanfare]} Summon a Holy Tiger token.
// {[act]} {[cost02]}, {[engage]}, put this card into your cemetery: Summon a Holy Tiger token. (This card has left the field by
// then, so a full field has room for it — ruling.)
import type { EffectContext } from "../../engine/effects/context";
import { activated, defineCard, fanfare } from "../helpers";

function* holyTiger(fx: EffectContext) {
  yield* fx.summon(["Holy Tiger"]);
}

export default defineCard({
  abilities: [fanfare({ resolve: holyTiger }), activated({ playPoints: 2, engageSelf: true, burySelf: true }, { resolve: holyTiger })],
});
