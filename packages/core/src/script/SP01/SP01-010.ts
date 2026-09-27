// SP01-010 Amelia, Sunny Paladin — Swordcraft follower, 4, 4/4. 指揮官.
// Whenever an Officer follower is put onto your field, select an enemy follower on the field and deal it 3 damage. (Once for each,
// also in the opponent's turn — rulings.)
// {[act]} {[cost00]}: You may summon an Officer follower that costs 2 or less from your hand or EX area. Activate only once per turn.
// (元のコスト. A card from the EX area keeps its counters — ruling.)
import { activated, defineCard, whenFollowerEntersYourField } from "../helpers";
import { and, costAtMost, enemyFollower, hasTrait, isFollower } from "../targets";

const officer = hasTrait("兵士");

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      { filter: officer },
    ),
    activated(
      {},
      {
        oncePerTurn: true,
        *resolve(fx) {
          const fits = and(isFollower, officer, costAtMost(2));
          const cards = [...fx.game.cards(fx.controller, "hand"), ...fx.game.cards(fx.controller, "ex")].filter((id) => fits(fx.game, id));
          yield* fx.putOntoField(yield* fx.chooseCards(cards, 0, 1));
        },
      },
    ),
  ],
});
