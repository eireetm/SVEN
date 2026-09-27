// CP03-091 Cursed Lancer — Abysscraft follower, 5, 5/5. ヴァンガード・シャドウパラディン.
// {[fanfare]} Give your leader {[defense]}+3. Bury the top 2 cards of your deck.
// At the start of your end phase, select an enemy follower on the field and, if there are at least 10 Shadow Paladin cards in
// your cemetery, destroy it.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, shadowPaladin } from "./shared";

const tenShadowPaladins = (g: GameReader, p: PlayerId) => countIn(g, p, "cemetery", shadowPaladin) >= 10;

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.mill(2);
      },
    }),
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (tenShadowPaladins(fx.game, fx.controller)) yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
