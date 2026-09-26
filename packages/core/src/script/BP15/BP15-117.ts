// BP15-117 Thunder God of the Tempest — Neutral follower, 7, 5/5. 大神.
// {[fanfare]} Choose up to 2. (1) Select an enemy amulet on the field and destroy it. (2) Deal 3 damage to each enemy
// follower on the field. (3) Give this Storm. (4) Draw 2 cards. (Targets are selected while playing it; (1) needs
// its target; each option once — rulings.)
import { defineCard, fanfare } from "../helpers";
import { enemyCardOnField, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modeCount: () => 2,
      modes: [
        {
          id: "amulet",
          label: "(1) Destroy an enemy amulet",
          targets: [enemyCardOnField({ filter: isAmulet })],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "damage",
          label: "(2) 3 damage to each enemy follower",
          *resolve(fx) {
            yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 3);
          },
        },
        {
          id: "storm",
          label: "(3) Storm",
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
          },
        },
        {
          id: "draw",
          label: "(4) Draw 2 cards",
          *resolve(fx) {
            yield* fx.draw(2);
          },
        },
      ],
    }),
  ],
});
