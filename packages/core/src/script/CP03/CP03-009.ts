// CP03-009 Tear Knight, Valeria — Forestcraft follower, 1, 1/1. ヴァンガード・アクアフォース.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1, Storm, and "Strike - Select an enemy follower on the field and, if
// it's the 3rd time an Aqua Force follower on your field has attacked this turn, deal 2 damage to the selected follower."
// (The Strike is written as this card's own, existing once it was given Drive — which happens once per follower, CR
// 14.4.7.3.1. Exactly the 3rd attack, this one included — rulings.)
import { defineCard, onDrive, rideAbility, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { aquaForceAttacks } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
    strike({
      triggerIf: (g, _c, self) => g.givenDrive(self),
      targets: [enemyFollower()],
      *resolve(fx) {
        if (aquaForceAttacks(fx.game, fx.controller) === 3) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
