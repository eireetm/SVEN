// EBD02-003 Falise, Innocent Sea Spray — Runecraft follower, 6, 4/5. 魔法使い・学院.
// {[fanfare]} Look at the top 5 cards of your deck. From among them, you may put up to 1 Mage follower that costs 3 or less and up to 1
// Mage spell that costs 3 or less into your EX area. They cost 3 less to play this turn. Put the rest on the bottom of your deck in
// any order. (元のコスト.)
// Whenever you play a Mage card, select an enemy follower on the field and deal it 2 damage. (Not for this card itself; a Mage spell
// in the opponent's Quick timing triggers it too — rulings.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { and, costAtMost, enemyFollower, hasTrait, isFollower, isSpell } from "../targets";

const mage = hasTrait("魔法使い");

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const top = fx.topCards(5);
        const fits = (f: typeof isFollower) => top.filter((id) => and(f, mage, costAtMost(3))(g, id));
        const followers = yield* fx.selectCards(fits(isFollower), 0, 1, fx.controller, top);
        const spells = yield* fx.selectCards(fits(isSpell), 0, 1, fx.controller, top);
        const moved = yield* fx.putIntoEx([...followers, ...spells]);
        yield* fx.bottomInAnyOrder(top.filter((id) => g.card(id)?.zone === "deck"));
        for (const id of moved) if (g.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -3, "endOfTurn");
      },
    }),
    whenYouPlay(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      mage,
    ),
  ],
});
