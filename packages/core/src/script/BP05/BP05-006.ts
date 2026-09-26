// BP05-006 Morton the Manipulator — Forestcraft follower, 3, 3/3. 超克.
// At the start of your end phase, an opponent chooses one of the following. (1) They can't draw a
// card during their next start phase. (2) They can't increase their maximum play points by 1
// during their next start phase. (3) They can't play followers during their next main phase.
// Rulings: the choosing opponent is affected; two Mortons may get the same choice (one effect);
// (3) stops playing followers, even by an effect that plays one, but not putting them onto the
// field. CR 1.3.3: the prohibition wins over the start phase's instructions.
import type { PlayerRestriction } from "../../model/state";
import { atStartOfYourEndPhase, defineCard } from "../helpers";

const OPTIONS: { id: PlayerRestriction["kind"]; label: string }[] = [
  { id: "noStartPhaseDraw", label: "Can't draw a card during your next start phase" },
  { id: "noStartPhaseMaxPlayPoints", label: "Can't increase your maximum play points during your next start phase" },
  { id: "cantPlayFollowers", label: "Can't play followers during your next main phase" },
];

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        // Any number of them instead if the opponent has BP20-T06 (CR 5.18: they choose).
        const kinds = yield* fx.choose(OPTIONS, 1, fx.game.choosesAnyNumberOfOptions(opponent) ? OPTIONS.length : 1, opponent);
        for (const kind of kinds) yield* fx.restrictPlayer(opponent, kind as PlayerRestriction["kind"]);
      },
    }),
  ],
});
