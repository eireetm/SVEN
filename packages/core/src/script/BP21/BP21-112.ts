// BP21-112 Gretina, Champion Fighter — Neutral follower, 4, 4/5. 機械・学院・超克.
// While you don't have a Super Evolution Point, this has Storm. (A passive — ruling.)
// Activate Discard an Academic card: Select an enemy follower on the field. Deal it 5 damage and draw a card. Activate only
// once per turn. (Needs a target — ruling.)
import { discardA } from "../costs";
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { academic } from "./shared";

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => (card === self && g.state.players[g.card(self)!.controller].superEvolutionPoints === 0 ? ["storm"] : []),
  },
  abilities: [
    activated(
      { custom: discardA(academic) },
      {
        timesPerTurn: 1,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
