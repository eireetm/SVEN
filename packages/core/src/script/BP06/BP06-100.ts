// BP06-100 Feather Sanctuary — Havencraft amulet, 5. 信仰・鳥族.
// {[fanfare]} Summon a Holy Falcon token.
// Activate {[engage]}, bury an amulet: Summon a Holy Falcon token. (This amulet itself may be the
// one buried — ruling.)
import type { EffectContext } from "../../engine/effects/context";
import { activated, defineCard, fanfare } from "../helpers";
import { buryFromYourField } from "../costs";
import { isAmulet } from "../targets";

function* falcon(fx: EffectContext) {
  yield* fx.summon(["Holy Falcon"]);
}

export default defineCard({
  abilities: [fanfare({ resolve: falcon }), activated({ engageSelf: true, custom: buryFromYourField(isAmulet) }, { resolve: falcon })],
});
