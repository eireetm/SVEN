// CP02-102 Winter Night Prayer — Havencraft spell, 4. デレマス・キュート.
// {[quick]}
// Select an enemy follower on the field. Banish it and, if there's a Cute follower on your field, give your leader
// {[defense]}+3. (Without an enemy follower it can't be played — ruling, CR 10.6.2.3.3.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { cute, followersOnYourField } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
        if (followersOnYourField(fx.game, fx.controller, cute) > 0) yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
