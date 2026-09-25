// BP07-103 Technolord — Neutral follower, 6, 6/6. 機械・大神.
// {[fanfare]} Banish 3 Machina cards from your cemetery: Choose up to 2 of the following. (1) Select
// an enemy follower on the field and destroy it. (2) Select an enemy amulet on the field and destroy
// it. (3) Deal 3 damage to each enemy leader. (4) Search your deck for a Machina card not named
// Technolord, reveal it, add it to your hand, then shuffle your deck.
// Rulings: (1) / (2) can't be chosen without a target; (3) / (4) can be chosen and the cost left
// unpaid (nothing happens); an option only once (CR 10.4.7.4, 5.18).
import { banishFromYour } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyCardOnField, enemyFollower, isAmulet, named } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYour(["cemetery"], machina, 3),
      modeCount: () => 2,
      modes: [
        {
          id: "follower",
          label: "(1) Destroy an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "amulet",
          label: "(2) Destroy an enemy amulet",
          targets: [enemyCardOnField({ filter: isAmulet })],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "leader",
          label: "(3) Deal 3 damage to each enemy leader",
          *resolve(fx) {
            yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 3);
          },
        },
        {
          id: "search",
          label: "(4) Search your deck for a Machina card not named Technolord",
          *resolve(fx) {
            yield* fx.search((id) => machina(fx.game, id) && !named("Technolord")(fx.game, id));
          },
        },
      ],
    }),
  ],
});
