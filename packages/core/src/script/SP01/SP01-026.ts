// SP01-026 Sharon, Seaside Nymph — Dragoncraft follower, 7, 3/3. 海洋.
// {[fanfare]} Recover 5 play points. (Not above the maximum — ruling.)
// Activate {[engage]}: Choose up to 2. (1) Select an enemy follower on the field. It can't attack enemies during its controller's next
// turn. (2) The next time 1 or more followers are put onto your field this turn, give one {[attack]}+1/{[defense]}+1. (3) Give your
// leader {[defense]}+2. (4) Draw a card.
// (Each option once; the follower of (1) is selected before (4) draws. (2) is a delayed trigger (CR 10.7.5): of followers put onto
// the field together its player picks one; a follower put onto the field by the Fanfare of the first one doesn't get it — rulings.)
import type { GameEvent } from "../../events/types";
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

/** The followers an event put onto `player`'s field (still there). */
function followersPutOntoField(e: GameEvent, player: PlayerId, game: GameReader): CardId[] {
  if (e.type !== "cardsMoved") return [];
  return e.moves.flatMap((m) =>
    m.to.zone === "field" &&
    m.from?.zone !== "field" &&
    m.to.player === player &&
    m.newCard !== null &&
    game.card(m.newCard)?.zone === "field" &&
    game.info(m.newCard).type === "follower"
      ? [m.newCard]
      : [],
  );
}

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.recoverPlayPoints(5);
      },
    }),
    activated(
      { engageSelf: true },
      {
        modeCount: () => 2,
        modes: [
          {
            id: "1",
            label: "An enemy follower can't attack during its controller's next turn",
            targets: [enemyFollower()],
            *resolve(fx) {
              yield* fx.cannotAttack(fx.targets[0]![0]!, "endOfOpponentsNextTurn");
            },
          },
          {
            id: "2",
            label: "The next follower put onto your field this turn gets +1/+1",
            *resolve(fx) {
              yield* fx.delay(2, "endOfTurn");
            },
          },
          {
            id: "3",
            label: "Give your leader +2 defense",
            *resolve(fx) {
              yield* fx.giveLeaderDefense(fx.controller, 2);
            },
          },
          {
            id: "4",
            label: "Draw a card",
            *resolve(fx) {
              yield* fx.draw(1);
            },
          },
        ],
      },
    ),
    // (2): "The next time 1 or more followers are put onto your field this turn, give one +1/+1."
    {
      kind: "automatic",
      timing: "other",
      delayed: true,
      trigger: (e, me, game) => !me.lookBack && followersPutOntoField(e, me.controller, game).length > 0,
      *resolve(fx) {
        const entered = fx.event ? followersPutOntoField(fx.event, fx.controller, fx.game) : [];
        const [one] = yield* fx.chooseCards(entered, 1, 1);
        if (one !== undefined) yield* fx.giveStats(one, 1, 1);
      },
    },
  ],
});
