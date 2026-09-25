// BP07-058 Shadow's Corrosion — Dragoncraft spell, 3. 自然・ドラゴニュート.
// This card can't be played from the EX area.
// At the start of your end phase, if this card is in your EX area, deal 1 damage to each enemy leader
// for every 5 Natura cards in your cemetery. (Valid in the EX area, CR 10.3.5; each copy triggers;
// 5–9 cards: 1, 10–14: 2 ... — rulings. Playing this ability is not playing a spell — ruling.)
// Select an enemy follower on the field. Deal it 4 damage and, if there's a Valdain, Cursed Shadow
// on your field, put this card into its owner's EX area. (It can't be played without a target —
// ruling.)
import { atStartOfYourEndPhase, defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, natura, onYourField } from "./shared";

export default defineCard({
  playableIf: (g, self) => g.playZone(self) !== "ex",
  abilities: [
    {
      ...atStartOfYourEndPhase({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "ex") return;
          const x = Math.floor(countIn(fx.game, fx.controller, "cemetery", natura) / 5);
          yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], x);
        },
      }),
      validIn: ["ex"],
    },
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        if (onYourField(fx.game, fx.controller, "Valdain, Cursed Shadow") && fx.game.card(fx.self)?.zone === "resolution") {
          yield* fx.putIntoEx([fx.self]);
        }
      },
    }),
  ],
});
