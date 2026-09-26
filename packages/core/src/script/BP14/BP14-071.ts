// BP14-071 Itsurugi, Paradise's End — Abysscraft advanced follower, 4, 6/5. 宴楽・魔界・獣.
// {[fanfare]} Select up to 3 enemy followers on the field. Deal 5 damage to one and 2 damage to the others.
// (Which one takes 5 is said as it resolves; with 2 selected, 5 and 2 — ruling.)
// During your turn, whenever an enemy follower is put from the field into the cemetery, deal 1 damage to its
// leader and give your leader {[defense]}+1. (Each one, tokens too — rulings.)
import { defineCard, fanfare, whenEnemyFollowerToCemetery } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower({ count: 3, upTo: true })],
      *resolve(fx) {
        const chosen = (fx.targets[0] ?? []).filter((id) => fx.game.card(id)?.zone === "field");
        if (chosen.length === 0) return;
        const [five] = chosen.length === 1 ? chosen : yield* fx.chooseCards(chosen, 1, 1);
        yield* fx.dealDamages(chosen.map((target) => ({ target, amount: target === five ? 5 : 2 })));
      },
    }),
    whenEnemyFollowerToCemetery(
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
