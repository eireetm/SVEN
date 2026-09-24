// BP03-117 Winged Inversion — Neutral spell, 1. 天使・堕天使.
// Choose: (1) Discard an Angel follower: Destroy an enemy follower.
// (2) Discard a Fallen Angel follower: Leader +3 defense. Draw a card.
// A mode that cannot be paid cannot be chosen (CR 5.18.3.1.2).
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, spell } from "../helpers";
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
          available: (g, p) => g.cards(p, "hand").some((id) => angel(g, id)),
          targets: [enemyFollower()],
          *resolve(fx) {
            const hand = fx.game.cards(fx.controller, "hand").filter((id) => angel(fx.game, id));
            yield* fx.discardCards(yield* fx.chooseCards(hand, 1, 1));
            yield* fx.destroy(fx.targets[0] ?? []);
          },
        },
        {
          id: "fallen",
          label: "Discard a Fallen Angel follower: +3 defense, draw",
          available: (g, p) => g.cards(p, "hand").some((id) => fallen(g, id)),
          *resolve(fx) {
            const hand = fx.game.cards(fx.controller, "hand").filter((id) => fallen(fx.game, id));
            yield* fx.discardCards(yield* fx.chooseCards(hand, 1, 1));
            yield* fx.giveLeaderDefense(fx.controller, 3);
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
