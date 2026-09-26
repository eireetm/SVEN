// Shared pieces of BP14 Forestcraft card scripts (not a card: the file name has no set prefix).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { AutomaticAbility } from "../types";
import { atStartOfYourEndPhase } from "../helpers";
import { anyFollower } from "../targets";

const SEASONAL = "seasonal";

/** BP14-004 / 005 "While this has 3 seasonal counters or less, it can't attack enemies" (CR 8.4.3.2.1). */
export const seasonsCantAttack = (g: GameReader, self: CardId): boolean => g.counters(self, SEASONAL) <= 3;

/**
 * BP14-004 / 005 "At the start of your end phase, select a follower on the field. Give it {[attack]}+X/
 * {[defense]}+X or deal it X damage, and place a seasonal counter on this. X equals this follower's attack."
 * (Either field; which of the two is decided as it resolves. With this follower gone, X is 0.)
 */
export const seasonsEndPhase: AutomaticAbility = atStartOfYourEndPhase({
  targets: [anyFollower()],
  *resolve(fx) {
    const target = fx.targets[0]![0]!;
    const onField = fx.game.card(fx.self)?.zone === "field";
    const x = onField ? (fx.game.info(fx.self).attack ?? 0) : 0;
    const [pick] = yield* fx.choose([
      { id: "stats", label: `+${x}/+${x}` },
      { id: "damage", label: `${x} damage` },
    ]);
    if (x > 0 && pick === "stats") yield* fx.giveStats(target, x, x);
    if (x > 0 && pick === "damage") yield* fx.dealDamage(target, x);
    if (onField) yield* fx.addCounters(fx.self, SEASONAL, 1);
  },
});
