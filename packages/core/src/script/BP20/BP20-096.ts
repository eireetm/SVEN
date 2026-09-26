// BP20-096 Holy Serpent's Blessing — Havencraft amulet, 3. 信仰.
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
// {[lastwords]} Choose one. (1) Give your leader {[defense]}+2. (2) {[cost01]}: Search your deck for a Holy Serpent's
// Blessing, summon it, then shuffle. ((2) may be chosen and not paid: then nothing — ruling; CR 10.4.7.2.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    lastWords({
      modes: [
        {
          id: "leader",
          label: "(1) Leader +2",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
        {
          id: "search",
          label: "(2) (1): A Holy Serpent's Blessing from your deck onto the field",
          cost: playPointsCost(1),
          *resolve(fx) {
            yield* fx.search((id) => named("Holy Serpent's Blessing")(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
