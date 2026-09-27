// CP03-099 Darkside Trumpeter — Abysscraft follower, 1, 2/2. ヴァンガード・シャドウパラディン. Stand Trigger.
// At the start of your end phase, select a Shadow Paladin follower on your field and, if there are at least 10 Shadow Paladin cards
// in your cemetery, refresh it.
// ----------
// (If this card is revealed by a drive check, refresh a follower on your field. For the rest of this turn, it can't attack
// enemy leaders.) (Resolved by the engine.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { yourFollower } from "../targets";
import { countIn, shadowPaladin } from "./shared";

const tenShadowPaladins = (g: GameReader, p: PlayerId) => countIn(g, p, "cemetery", shadowPaladin) >= 10;

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [yourFollower({ filter: shadowPaladin })],
      *resolve(fx) {
        if (tenShadowPaladins(fx.game, fx.controller)) yield* fx.refresh(fx.targets[0]!);
      },
    }),
  ],
});
