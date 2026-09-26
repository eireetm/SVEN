// BP17-T06 Curse of the Black Dragon — Dragoncraft spell token, 0. 竜族・武闘竜人・キラー.
// This can't be played unless Overflow is active for you.
// At the start of your end phase, if this is in your EX area and Overflow isn't active for you, deal 1 damage to your leader.
// (Valid in the EX area — ruling.)
// ----------
// Select a Rowen, Dragon Lance on your field and give it "If this would deal damage, it deals that much plus 1 instead" for
// the rest of this turn. (Two of them are +2; its attack damage and its abilities' damage — rulings.)
import { atStartOfYourEndPhase, defineCard, spell } from "../helpers";
import { named, yourFollower } from "../targets";

export default defineCard({
  playableIf: (g, _self, p) => g.overflow(p),
  abilities: [
    {
      ...atStartOfYourEndPhase({
        condition: (g, p) => !g.overflow(p),
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
        },
      }),
      validIn: ["ex"],
    },
    spell({
      targets: [yourFollower({ filter: named("Rowen, Dragon Lance") })],
      *resolve(fx) {
        yield* fx.dealsMoreDamage(fx.targets[0]![0]!, 1, "endOfTurn");
      },
    }),
  ],
});
