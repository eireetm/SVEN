// BP15-012 Adherent of Annihilation — Forestcraft follower, 2, 2/3. 絶傑・狩人.
// {[fanfare]} Select an enemy follower on the field and, if there are at least 3 Hunter cards in your cemetery,
// deal it 2 damage. When it's put from the field into the cemetery this turn, give your leader {[defense]}+2.
// (The English text puts the "if" on the damage only; the delayed trigger comes either way. It works after this
// card has left the field, and twice for two of them — rulings.)
import { defineCard, delayedWhenPutIntoCemetery, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, hunter } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const card = fx.targets[0]![0]!;
        if (countIn(fx.game, fx.controller, "cemetery", hunter) >= 3) yield* fx.dealDamage(card, 2);
        yield* fx.delay(1, "endOfTurn", { card });
      },
    }),
    delayedWhenPutIntoCemetery(function* (fx) {
      yield* fx.giveLeaderDefense(fx.controller, 2);
    }),
  ],
});
