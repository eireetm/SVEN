// BP08-028 Dance of Usurpation — Swordcraft spell, 4. 絶傑・盗賊.
// Select any number of enemy followers and divide 4 damage, or 8 with 10 cards in opponents'
// cemeteries. With 20, also deal 8 to each enemy leader. Each selected follower gets at least 1;
// selecting none is allowed (rulings; CR 10.6.2.3.2, 10.6.2.4).
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, spell } from "../helpers";
import { ANY, enemyFollower } from "../targets";

const cemeteryCount = (g: GameReader, p: PlayerId) => g.cards(g.opponent(p), "cemetery").length;
const divided = (g: GameReader, p: PlayerId) => (cemeteryCount(g, p) >= 10 ? 8 : 4);

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower({ count: ANY, upTo: true, max: divided })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], divided(fx.game, fx.controller));
        if (cemeteryCount(fx.game, fx.controller) >= 20) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 8);
        }
      },
    }),
  ],
});
