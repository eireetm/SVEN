// BP22-037 クロノウィッチ — Runecraft follower, 5, 4/4. 魔法使い.
// 進化コスト1：これは進化する。
// 自分のターン中、自分の消滅領域にカードが置かれたとき、相手の場のフォロワー1体を選ぶ。それに1ダメージ。
// ファンファーレ自分の消滅領域が10枚以上なら、このターン、次に自分の場にウィッチフォロワーが1体以上出たとき、その中の1体は進化する。
// (Evolve (1). During your turn, whenever a card is put into your banished zone, select an enemy follower on the field and deal it
// 1 damage (see shared-rune.ts). Fanfare - If there are at least 10 cards in your banished zone, the next time 1 or more
// Runecraft followers are put onto your field this turn, evolve one of them: a delayed trigger (CR 10.7.5); of followers put onto
// the field together you pick one, not one put there later by the first one's Fanfare; no evolve cost, and you may decline
// (rulings).)
import type { GameEvent } from "../../events/types";
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isClass } from "../targets";
import { chronoWitchPing } from "./shared-rune";

/** The Runecraft followers an event put onto `player`'s field (still there). */
function runecraftFollowersPutOntoField(e: GameEvent, player: PlayerId, game: GameReader): CardId[] {
  if (e.type !== "cardsMoved") return [];
  return e.moves.flatMap((m) =>
    m.to.zone === "field" &&
    m.from?.zone !== "field" &&
    m.to.player === player &&
    m.newCard !== null &&
    game.card(m.newCard)?.zone === "field" &&
    game.info(m.newCard).type === "follower" &&
    isClass("Runecraft")(game, m.newCard)
      ? [m.newCard]
      : [],
  );
}

export default defineCard({
  abilities: [
    evolveAbility(1),
    chronoWitchPing,
    fanfare({
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "banished").length >= 10) yield* fx.delay(3, "endOfTurn");
      },
    }),
    // The delayed trigger (index 3): "the next time 1 or more Runecraft followers are put onto your field this turn".
    {
      kind: "automatic",
      timing: "other",
      delayed: true,
      trigger: (e, me, game) => !me.lookBack && runecraftFollowersPutOntoField(e, me.controller, game).length > 0,
      *resolve(fx) {
        const entered = (fx.event ? runecraftFollowersPutOntoField(fx.event, fx.controller, fx.game) : []).filter(
          (id) => fx.game.card(id)?.zone === "field",
        );
        const [one] = yield* fx.chooseCards(entered, 1, 1);
        if (one !== undefined) yield* fx.evolve(one);
      },
    },
  ],
});
