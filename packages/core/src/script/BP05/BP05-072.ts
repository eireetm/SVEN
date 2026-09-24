// BP05-072 Apostle of Lust — Abysscraft follower, 4, 4/4. 絶傑・魔界.
// Activate {[engage]}, give your leader {[defense]}-1: Select a follower that costs 2 play points
// or less in your cemetery and put it onto your field. (元のコスト: printed cost.)
// Whenever another Demon follower is put onto your field, give your leader {[defense]}+1.
// Rulings: at 1 defense the cost brings the leader to 0 and you lose before the +1 resolves; two
// Demons entering together give +2.
import { activated, defineCard, whenFollowerEntersYourField } from "../helpers";
import { and, costAtMost, hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, leaderDefense: 1 },
      {
        targets: [inYourZone("cemetery", { filter: and(isFollower, costAtMost(2)) })],
        *resolve(fx) {
          const card = fx.targets[0]![0]!;
          if (fx.game.card(card)?.zone === "cemetery") yield* fx.putOntoField([card]);
        },
      },
    ),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { another: true, filter: hasTrait("魔界") },
    ),
  ],
});
