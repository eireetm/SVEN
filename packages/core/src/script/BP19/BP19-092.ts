// BP19-092 Erralde, Troth Convict — Havencraft follower, 6, 5/5. 八獄・先導.
// Your abilities that activate at the start of the end phase activate 1 additional time. (Either player's end phase, this
// card's own ability and cards in the EX area too; two of these: 3 times — rulings.)
// At the start of your end phase, choose 1. If you have another Condemned follower on your field, choose up to 2 instead.
// (1) Select an enemy follower on the field and deal it 4 damage. (2) Give your leader {[defense]}+1 and refresh this.
// (3) Draw a card. ((1) needs its target; (2) may be chosen while this is reserved; an option once each — rulings; CR 5.18.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { condemnedFollower } from "./shared";

export default defineCard({
  field: { extraEndPhaseTriggers: 1 },
  abilities: [
    atStartOfYourEndPhase({
      modeCount: (g, c, self) => (g.cards(c, "field").some((id) => id !== self && condemnedFollower(g, id)) ? 2 : 1),
      modes: [
        {
          id: "damage",
          label: "(1) 4 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          },
        },
        {
          id: "leader",
          label: "(2) Leader +1, refresh this",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 1);
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
          },
        },
        {
          id: "draw",
          label: "(3) Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
