// CP04-012 Nea — Forestcraft follower, 2, 2/3. プリコネ・〈レイジ・レギオン〉.
// {[ub]} Activate {[engage]} this: During each opponent's next turn, this has "While this is engaged, each enemy follower on the
// field must attack once per turn if able."
// Ward.
// {[lastwords]} Select an enemy follower on the field. It doesn't refresh during its controller's next start phase.
// (Rulings: the opponent may do other things first, but can't end the main phase while a follower of theirs that hasn't attacked
// this turn can attack — also one put onto the field later; one that can't attack, or has attacked, is free; twice applied it is
// still once per turn.)
import { activated, defineCard, lastWords, ub } from "../helpers";
import { enemyFollower } from "../targets";

const MUST_ATTACK = "Each enemy follower must attack once per turn if able while this is engaged.";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          *resolve(fx) {
            yield* fx.gainText(fx.self, MUST_ATTACK, "endOfOpponentsNextTurn");
          },
        },
      ),
    ),
    lastWords({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.skipNextRefresh(fx.targets[0]![0]!);
      },
    }),
  ],
  field: {
    // Only in the opponent's turn: the text is had "during each opponent's next turn".
    forcesEnemyAttacks: (g, self) =>
      g.activePlayer !== g.controller(self) && g.card(self)?.engaged === true && g.hasGainedText(self, MUST_ATTACK),
  },
});
