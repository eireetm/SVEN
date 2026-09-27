// CP03-024 Star Call Trumpeter — Swordcraft follower, 4, 3/3. ヴァンガード・ロイヤルパラディン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Select up to 1 enemy follower on the field. Deal it 4 damage and give this follower {[attack]}+1/{[defense]}+1.
// {[fanfare]} Search your deck for up to 2 cards with "Blaster" in their names, reveal them, add one to your hand, bury the
// other, then shuffle. (Japanese: followers. One found goes to the hand — ruling.)
import type { CardId } from "../../model/ids";
import { defineCard, fanfare, onDrive, rideAbility } from "../helpers";
import { enemyFollower, isFollower, nameIncludes } from "../targets";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        const [target] = fx.targets[0] ?? [];
        if (target !== undefined) yield* fx.dealDamage(target, 4);
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const found: CardId[] = [];
        // Found and revealed, then sorted out: one to the hand, the other into the cemetery.
        yield* fx.search((id) => isFollower(g, id) && nameIncludes("Blaster")(g, id), {
          max: 2,
          *destination(id) {
            found.push(id);
            return "deck";
          },
        });
        if (found.length < 2) {
          yield* fx.returnToHand(found);
          return;
        }
        const [keep] = yield* fx.chooseCards(found, 1, 1);
        yield* fx.returnToHand([keep!]);
        yield* fx.bury(found.filter((id) => id !== keep));
      },
    }),
  ],
});
