// BP13-024 Homebound Infantryman — Swordcraft follower, 1, 3/1. 兵士.
// At the start of your end phase, if there's a Commander card that costs 3 or more on your field,
// {[cost01]}: Summon this card from your cemetery. (Valid in the cemetery — ruling, CR 10.3.5; 元のコスト.)
// ----------
// Assail.
// This follower can't attack enemy leaders.
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { playPointsCost } from "../costs";
import { and, costAtLeast } from "../targets";
import { commander } from "./shared";

export default defineCard({
  keywords: ["assail"],
  cannotAttackLeader: () => true,
  abilities: [
    {
      ...atStartOfYourEndPhase({
        condition: (g, p) => g.cards(p, "field").some((id) => and(commander, costAtLeast(3))(g, id)),
        cost: playPointsCost(1),
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putOntoField([fx.self]);
        },
      }),
      validIn: ["cemetery"],
    },
  ],
});
