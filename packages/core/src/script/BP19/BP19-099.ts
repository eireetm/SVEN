// BP19-099 Meus Gourmand — Havencraft follower, 1, 2/2. 獣・コック.
// {[fanfare]} If this was put onto the field from anywhere other than the hand, choose 1. (1) Deal 2 damage to each enemy
// leader. (2) Give your leader {[defense]}+2. (From the EX area, deck or cemetery — ruling.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare } from "../helpers";

const notFromHand = (g: GameReader, _c: PlayerId, self: CardId): boolean => {
  const from = g.enteredFrom(self);
  return from !== null && from !== "hand";
};

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "damage",
          label: "(1) 2 damage to each enemy leader",
          available: notFromHand,
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
          },
        },
        {
          id: "leader",
          label: "(2) Leader +2",
          available: notFromHand,
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
      ],
    }),
  ],
});
