// BP12 Dragoncraft abilities shared by a card and its evolved card (not a card).
import type { ActivatedAbility, AutomaticAbility } from "../types";
import { activated, whenYouDiscardAny } from "../helpers";
import { and, costAtMost, enemyLeaderOrFollower, isClass, isFollower, yourFollower } from "../targets";
import { yourTurn } from "./shared";

/** A {[dragoncraft]} follower that costs 2 or less (元のコスト, BP12-059 / 060). */
export const smallDragoncraftFollower = and(isFollower, isClass("Dragoncraft"), costAtMost(2));

/**
 * BP12-052 / 053 "During your turn, whenever you discard 1 or more cards, select an enemy leader or
 * enemy follower on the field and deal it 2 damage." Once for cards discarded together (rulings).
 */
export const plesiosaurusDiscard: AutomaticAbility = whenYouDiscardAny({
  triggerIf: yourTurn,
  targets: [enemyLeaderOrFollower()],
  *resolve(fx) {
    yield* fx.dealDamage(fx.targets[0]![0]!, 2);
  },
});

/**
 * BP12-059 / 060 "Activate {[engage]}: Select a {[dragoncraft]} follower that costs 2 or less on your
 * field. Give it +1/+1 and Storm."
 */
export const dragoonBoost: ActivatedAbility = activated(
  { engageSelf: true },
  {
    targets: [yourFollower({ filter: smallDragoncraftFollower })],
    *resolve(fx) {
      const target = fx.targets[0]![0]!;
      if (fx.game.card(target)?.zone !== "field") return;
      yield* fx.giveStats(target, 1, 1);
      yield* fx.giveKeyword(target, "storm");
    },
  },
);
