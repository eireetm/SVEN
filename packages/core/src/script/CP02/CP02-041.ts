// CP02-041 Center Street — Runecraft spell, 3. デレマス・パッション.
// {[quick]}
// Select an enemy follower on the field. Deal it 5 damage and, if there's a Passion follower on your field, draw a card.
// (Without an enemy follower it can't be played — ruling, CR 10.6.2.3.3.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { followersOnYourField, passion } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        if (followersOnYourField(fx.game, fx.controller, passion) > 0) yield* fx.draw(1);
      },
    }),
  ],
});
