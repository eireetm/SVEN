// ECP01-030 Mr. C.B. — Dragoncraft follower, 4, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// On Race - Give this follower {[attack]}+1/{[defense]}+1. Refresh it. Draw a card.
// Activate {[engage]}, discard an Umamusume card: Select an enemy follower on the field. Deal it 5 damage and, if you discarded an
// Umamusume card that costs 7 or more, draw a card. (元のコスト. Not playable, so not payable, without an enemy follower to select
// — ruling.)
import { activated, defineCard, onRace, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { discardUmamusumeRecorded, discardedCostAtLeast, plusOneThis } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        yield* plusOneThis(fx);
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
        yield* fx.draw(1);
      },
    }),
    activated(
      { engageSelf: true, custom: discardUmamusumeRecorded },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          if (discardedCostAtLeast(fx, 7)) yield* fx.draw(1);
        },
      },
    ),
  ],
});
