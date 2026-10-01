// BP22-073 竜の峡谷 — Dragoncraft amulet, 8. 竜族.
// 自分の場にドラゴンフォロワーが出たとき、相手の場のフォロワー1体を選ぶ。それに「場に出たフォロワーの攻撃力」と同じダメージ。
// ファンファーレ自分のデッキの上3枚を見る。その中から、ドラゴンフォロワー1枚を場に出してよい。残りを好きな順にデッキの下に置く。
// (Whenever a Dragoncraft follower is put onto your field, select an enemy follower on the field and deal it damage equal to that
// follower's attack — its attack then, or when it left the field if it has left (CR 10.11.1; taken from when it entered). Fanfare -
// Look at the top 3 cards of your deck; you may put a Dragoncraft follower among them onto your field; put the rest on the bottom in
// any order.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { enemyFollower, isClass, isFollower } from "../targets";
import type { AutomaticAbility } from "../types";

const dragonFollower = (g: import("../../engine/query").GameReader, id: string) => isFollower(g, id) && isClass("Dragoncraft")(g, id);

/** Like whenFollowerEntersYourField, with the follower's attack when it entered (`count`), for when it left before this resolves. */
const whenDragonFollowerEnters: AutomaticAbility = {
  kind: "automatic",
  timing: "other",
  trigger: (e, me, game) =>
    me.lookBack || e.type !== "cardsMoved"
      ? []
      : e.moves
          .filter(
            (m) =>
              m.to.zone === "field" &&
              m.from?.zone !== "field" &&
              m.to.player === me.controller &&
              m.newCard !== null &&
              game.card(m.newCard)?.zone === "field" &&
              dragonFollower(game, m.newCard),
          )
          .map((m) => ({ card: m.newCard!, count: game.info(m.newCard!).attack ?? 0 })),
  targets: [enemyFollower()],
  *resolve(fx) {
    const card = fx.data?.card;
    const attack = card !== undefined && fx.game.card(card)?.zone === "field" ? (fx.game.info(card).attack ?? 0) : (fx.data?.count ?? 0);
    yield* fx.dealDamage(fx.targets[0]![0]!, Math.max(0, attack));
  },
};

export default defineCard({
  abilities: [
    whenDragonFollowerEnters,
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: dragonFollower, to: "field" });
      },
    }),
  ],
});
