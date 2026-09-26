// BP12-007 Intertwined Resolve — Forestcraft spell, 1. 自然・エルフ族・獣.
// Choose one. (1) Put a Natura card from your field into its owner's EX area: Select an enemy follower
// on the field and deal it 3 damage. (2) Summon 2 Fairy tokens.
// ((1) can't be chosen without an enemy follower; a token put into the EX area stays there, without
// its damage and effects — rulings. The process is optional, CR 10.4.7.5.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { FAIRY, hasRoom, natura } from "./shared";

/** A Natura card on your field whose owner's EX area has room (CR 4.8.3.2). */
const movable = (g: GameReader, p: PlayerId): CardId[] =>
  g.cards(p, "field").filter((id) => natura(g, id) && hasRoom(g, g.card(id)!.owner, "ex"));

const naturaToEx: CustomCost = {
  canPay: (g, c) => movable(g, c).length > 0,
  *pay(fx) {
    const [card] = yield* fx.chooseCards(movable(fx.game, fx.controller), 1, 1);
    if (card !== undefined) yield* fx.putIntoEx([card]);
  },
};

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "damage",
          label: "(1) Put a Natura card from your field into the EX area: 3 damage to an enemy follower",
          targets: [enemyFollower()],
          cost: naturaToEx,
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          },
        },
        {
          id: "fairies",
          label: "(2) Summon 2 Fairies",
          *resolve(fx) {
            yield* fx.summon([FAIRY, FAIRY]);
          },
        },
      ],
    }),
  ],
});
