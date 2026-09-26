// BP20-T03 White Psalm, New Revelation — Runecraft amulet token, 1. 絶傑・アイドル.
// {[lastwords]} Summon a Black Psalm, New Revelation token and give your leader {[defense]}+1.
// Activate {[engage]} 3 Idolatry cards on your field: Bury this. (This one may be among them.)
import { BLACK_PSALM } from "./shared";
import { psalm } from "./shared-rune";

export default psalm(BLACK_PSALM, function* (fx) {
  yield* fx.giveLeaderDefense(fx.controller, 1);
});
