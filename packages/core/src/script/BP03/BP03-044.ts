// BP03-044 Check — Runecraft spell, 3. チェス.
// Select an enemy follower. Deal it 4. Look at the top 3. You may reveal a Chess card with a
// different name from this card and add it to your hand. Put the rest on the bottom.
import { defineCard, spell } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        const top = fx.topCards(3);
        const mine = fx.game.info(fx.self).name;
        const matching = top.filter((id) => hasTrait("チェス")(fx.game, id) && fx.game.info(id).name !== mine);
        const [chosen] = yield* fx.selectCards(matching, 0, 1, fx.controller, top);
        if (chosen) {
          yield* fx.reveal([chosen]);
          yield* fx.returnToHand([chosen]);
        }
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
