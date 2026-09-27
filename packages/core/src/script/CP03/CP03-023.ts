// CP03-023 Swordsman of the Explosive Flames, Palamedes — Swordcraft follower, 4, 5/3. ヴァンガード・ロイヤルパラディン.
// While there are at least 15 Royal Paladin cards in your cemetery, this follower has Storm and "Strike - Give this follower
// {[attack]}+1/{[defense]}+1." (A passive ability: gained and lost as the count changes — ruling. The Strike is written as this
// card's own, existing while the condition holds.)
// {[fanfare]} Select an enemy follower on the field and deal it 5 damage.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare, strike } from "../helpers";
import { enemyFollower } from "../targets";

// typeAndTraits, not info: this is read while keywords are being computed.
const fifteen = (g: GameReader, p: PlayerId) => g.cards(p, "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("ロイヤルパラディン")).length >= 15;

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => (card === self && fifteen(g, g.controller(self)) ? ["storm"] : []),
  },
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
    strike({
      triggerIf: (g, c) => fifteen(g, c),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
