// Shared pieces of BP15 Forestcraft card scripts (not a card: the file name has no set prefix).
import type { AutomaticAbility } from "../types";
import { whenYourFollowerEvolves, whenYourFollowerLeaves } from "../helpers";
import { enemyFollower } from "../targets";

/**
 * BP15-004 / 005 "Whenever a follower on your field evolves, deal 1 damage to each enemy leader and 2 damage to
 * each enemy follower on the field, and give your leader {[defense]}+1." (Also during the opponent's turn —
 * ruling.)
 */
export const piercyeFrost: AutomaticAbility = whenYourFollowerEvolves({
  *resolve(fx) {
    const opp = fx.game.opponent(fx.controller);
    yield* fx.dealDamages([{ target: fx.game.leader(opp), amount: 1 }, ...fx.game.followers(opp).map((target) => ({ target, amount: 2 }))]);
    yield* fx.giveLeaderDefense(fx.controller, 1);
  },
});

/**
 * BP15-006 / 007 "During your turn, whenever a token follower is put from your field into the cemetery, select an
 * enemy follower on the field and give it {[attack]}-1/{[defense]}-1."
 */
export const puppeteerCurse: AutomaticAbility = whenYourFollowerLeaves(
  {
    targets: [enemyFollower()],
    *resolve(fx) {
      yield* fx.giveStats(fx.targets[0]![0]!, -1, -1);
    },
  },
  { to: "cemetery", onlyYourTurn: true, filter: (m, g) => g.db.get(m.def).token },
);
