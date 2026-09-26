// BP14-068 Mermaid Song — Dragoncraft spell, 3. 海洋.
// When playing this, engage a Marine follower on your field: This costs 2 less to play. (CR 10.4.7.3)
// ----------
// Select an enemy follower on the field. {[engage]} it and draw a card. It doesn't refresh during its
// controller's next start phase. (Also when it was already engaged — ruling; not playable without a target.)
import { engageYourCards } from "../costs";
import { defineCard, spell } from "../helpers";
import { and, enemyFollower, isFollower } from "../targets";
import { marine } from "./shared";

export default defineCard({
  playOptions: [{ id: "engage", label: "Engage a Marine follower: 2 less", ...engageYourCards(and(isFollower, marine), 1), costDelta: -2 }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.engage([target]);
        yield* fx.skipNextRefresh(target);
        yield* fx.draw(1);
      },
    }),
  ],
});
