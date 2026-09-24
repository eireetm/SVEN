// BP03-117 Winged Inversion — Neutral spell, 1. 天使・堕天使.
// Choose one: (1) Discard an Angel follower: Select an enemy follower and destroy it.
// (2) Discard a Fallen Angel follower: Give your leader +3 defense. Draw a card.
// Each discard is an optional additional cost of its option: the player may choose an option
// and not pay (or be unable to pay); the spell is then played for its play points only and the
// option does nothing (ruling). Option (1) still needs an enemy follower to select (CR 5.18.3.1.2).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, spell } from "../helpers";
import { discardA } from "../costs";
import { enemyFollower, hasTrait, isFollower } from "../targets";

const angel = (g: GameReader, id: CardId) => isFollower(g, id) && hasTrait("天使")(g, id);
const fallen = (g: GameReader, id: CardId) => isFollower(g, id) && hasTrait("堕天使")(g, id);

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "angel",
          label: "Discard an Angel follower: destroy an enemy follower",
          cost: discardA(angel),
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0] ?? []);
          },
        },
        {
          id: "fallen",
          label: "Discard a Fallen Angel follower: +3 defense, draw",
          cost: discardA(fallen),
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 3);
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
