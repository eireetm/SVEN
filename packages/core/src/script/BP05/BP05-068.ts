// BP05-068 Total Domination — Dragoncraft spell, 2. 絶傑・竜族.
// Select a follower on your field. Deal 2 damage to it and each enemy follower on the field. Then,
// if there is a Galmieux, Omen of Disdain on your field, deal 2 more damage to each enemy follower
// on the field. (A Galmieux brought to 0 defense by the first part is still on the field —
// ruling, CR 11.3. Needs a follower of yours — ruling.)
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";
import { onYourField } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.targets[0]![0]!, ...fx.game.followers(opponent)], 2);
        if (onYourField(fx.game, fx.controller, "Galmieux, Omen of Disdain")) yield* fx.dealDamageEach(fx.game.followers(opponent), 2);
      },
    }),
  ],
});
