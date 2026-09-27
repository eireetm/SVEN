// CP03-019 Coral Assault — Forestcraft follower, 2, 2/2. ヴァンガード・アクアフォース.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Select up to 1 enemy follower on the field. Deal it 2 damage and give this follower {[attack]}+1/{[defense]}+1.
// Whenever an Aqua Force follower on your field attacks, select an enemy follower on the field and, if it's the 3rd time an Aqua
// Force follower on your field has attacked this turn, deal 2 damage to the selected follower. (Exactly the 3rd — rulings.)
import { defineCard, onDrive, rideAbility, whenYourFollowerAttacks } from "../helpers";
import { enemyFollower } from "../targets";
import { aquaForce, aquaForceAttacks } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        const [target] = fx.targets[0] ?? [];
        if (target !== undefined) yield* fx.dealDamage(target, 2);
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    whenYourFollowerAttacks(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          if (aquaForceAttacks(fx.game, fx.controller) === 3) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      aquaForce,
    ),
  ],
});
