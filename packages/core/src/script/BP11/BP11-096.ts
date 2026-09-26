// BP11-096 Haven Fire — Havencraft spell, 2. 荒野・信仰・狂信.
// This card costs 1 less to play if there's a Selena, Sugarkiss Assassin on your field.
// ----------
// Select an enemy follower on the field and deal it 4 damage. If there's a Wasteland card in your EX
// area, deal 1 damage to its leader.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { onYourField, wasteland } from "./shared";

export default defineCard({
  playCost: (g, _self, c) => (onYourField(g, c, "Selena, Sugarkiss Assassin") ? -1 : 0),
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 4);
        if (fx.game.cards(fx.controller, "ex").some((id) => wasteland(fx.game, id))) yield* fx.dealDamage(leader, 1);
      },
    }),
  ],
});
