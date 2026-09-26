// BP12-087 Rola, Inferno Dragoon (Evolved) — Havencraft follower, 3/3. 機械・信仰・偶像.
// On Evolve - Choose one. (1) Select an enemy follower on the field and deal it damage equal to the number
// of Machina followers on your field. (2) Give this follower Storm. ((1) can't be chosen without a
// target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "damage",
          label: "(1) Damage equal to your Machina followers",
          targets: [enemyFollower()],
          *resolve(fx) {
            const x = fx.game.followers(fx.controller).filter((id) => machina(fx.game, id)).length;
            yield* fx.dealDamage(fx.targets[0]![0]!, x);
          },
        },
        {
          id: "storm",
          label: "(2) Give this follower Storm",
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
          },
        },
      ],
    }),
  ],
});
