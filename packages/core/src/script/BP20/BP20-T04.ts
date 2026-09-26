// BP20-T04 Black Psalm, New Revelation — Runecraft amulet token, 1. 絶傑・アイドル.
// {[lastwords]} Summon a White Psalm, New Revelation token and deal 1 damage to each enemy leader.
// Activate {[engage]} 3 Idolatry cards on your field: Bury this. (This one may be among them.)
import { WHITE_PSALM } from "./shared";
import { psalm } from "./shared-rune";

export default psalm(WHITE_PSALM, function* (fx) {
  yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
});
