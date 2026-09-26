// BP16-026 Ravening Tentacles — Swordcraft spell, 1. 兵士・獣・レヴィオン.
// As an additional cost to play this, engage a Levin follower on your field. (Reserved ones, CR 10.4.6.)
// ----------
// Select an enemy follower on the field. Deal it 4 damage, give your leader {[defense]}+2, and, if there's a
// follower on your field with "Yurius" in its name, draw a card. (Not without a target — ruling.)
import { engageYourCards } from "../costs";
import { defineCard, spell } from "../helpers";
import { and, enemyFollower, isFollower } from "../targets";
import { followerNamedOnField, levin } from "./shared";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "engage", label: "Engage a Levin follower on your field", ...engageYourCards(and(isFollower, levin)) }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.giveLeaderDefense(fx.controller, 2);
        if (followerNamedOnField(fx.game, fx.controller, "Yurius")) yield* fx.draw(1);
      },
    }),
  ],
});
