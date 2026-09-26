// BP16-025 Amalia, Luxsteel Paladin — Swordcraft follower, 4, 4/4. 兵士.
// {[fanfare]} Select an enemy follower on the field. Deal it 4 damage and summon an Officer token follower from
// your EX area. (Not without a target — ruling.)
// {[act]} {[cost00]}: Deal 4 damage to each enemy leader. Draw a card. Activate only if there are at least 3
// Officer token followers on your field with different names, and only once per turn.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { officerTokenFollower, threeOfficerNames } from "./shared-sword";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        const officers = fx.game.cards(fx.controller, "ex").filter((id) => officerTokenFollower(fx.game, id));
        yield* fx.putOntoField(yield* fx.chooseCards(officers, 1, 1));
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        condition: threeOfficerNames,
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 4);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
