// BP11-092 Holy Sanctuary — Havencraft amulet, 5. 信仰・偶像.
// This card doesn't refresh during your start phase.
// Whenever your leader gains defense, refresh this card. (Also during the opponent's turn — ruling.)
// Activate {[engage]}: Choose one that you haven't chosen this turn. (1) Select an enemy follower on the
// field and deal it 3 damage. (2) Select a follower on your field and give it {[attack]}+1/{[defense]}+1.
// (3) Summon a Holy Tiger token. (Per Sanctuary — ruling.)
import type { Mode } from "../types";
import { activated, defineCard, whenYourLeaderGainsDefense } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";

/** An option this Sanctuary hasn't chosen this turn; choosing it records it. */
const once = (mode: Mode): Mode => ({
  ...mode,
  available: (g, _p, self) => g.usesThisTurn(self, `option:${mode.id}`) === 0,
  *resolve(fx) {
    fx.recordUse(`option:${mode.id}`);
    yield* mode.resolve(fx);
  },
});

export default defineCard({
  noStartPhaseRefresh: true,
  abilities: [
    whenYourLeaderGainsDefense({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        modes: [
          once({
            id: "damage",
            label: "(1) 3 damage to an enemy follower",
            targets: [enemyFollower()],
            *resolve(fx) {
              yield* fx.dealDamage(fx.targets[0]![0]!, 3);
            },
          }),
          once({
            id: "buff",
            label: "(2) A follower of yours +1/+1",
            targets: [yourFollower()],
            *resolve(fx) {
              yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
            },
          }),
          once({
            id: "tiger",
            label: "(3) Summon a Holy Tiger",
            *resolve(fx) {
              yield* fx.summon(["Holy Tiger"]);
            },
          }),
        ],
      },
    ),
  ],
});
