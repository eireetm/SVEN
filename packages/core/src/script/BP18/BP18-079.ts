// BP18-079 Vedd, Burial Wolf — Abysscraft follower, 2, 3/3. 透京・魔界・獣.
// {[fanfare]} You may discard a 2-cost card. If you do, draw a card. If you don't, bury this. (元のコスト.)
// {[act]} {[cost00]}: Select an enemy leader or enemy follower on the field and deal it 3 damage. Activate only if there are
// at least ten 2-cost cards in your cemetery, and only once per turn.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";
import { costsTwo, twoCostInCemetery } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const twos = fx.game.cards(fx.controller, "hand").filter((id) => costsTwo(fx.game, id));
        const [card] = yield* fx.chooseCards(twos, 0, Math.min(1, twos.length));
        if (card !== undefined) {
          yield* fx.discardCards([card]);
          yield* fx.draw(1);
        } else if (fx.game.card(fx.self)?.zone === "field") {
          yield* fx.bury([fx.self]);
        }
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        condition: (g, c) => twoCostInCemetery(g, c) >= 10,
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
    ),
  ],
});
