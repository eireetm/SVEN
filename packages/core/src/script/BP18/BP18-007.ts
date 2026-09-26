// BP18-007 May, Eager Elf — Forestcraft follower, 1, 1/1. エルフ族.
// You may play this from the cemetery if you've played at least 3 cards this turn. (Valid in the cemetery; the cost is
// paid — rulings.)
// ----------
// {[fanfare]} Select an enemy follower on the field and deal it 1 damage. If this wasn't put onto the field from hand, put
// this on the bottom of your deck. (From the cemetery counts; without a target nothing happens — rulings.)
// During your turn, when this leaves the field, select an enemy follower on the field and deal it 1 damage.
import { defineCard, fanfare, whenThisLeavesField } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  playableFromCemetery: (g, _self, p) => g.playedThisTurn(p) >= 3,
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        if (fx.game.card(fx.self)?.zone === "field" && fx.game.enteredFrom(fx.self) !== "hand") yield* fx.putOnDeck([fx.self], "bottom");
      },
    }),
    whenThisLeavesField({
      triggerIf: (g, c) => g.activePlayer === c,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
  ],
});
