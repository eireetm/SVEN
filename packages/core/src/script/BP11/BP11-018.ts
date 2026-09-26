// BP11-018 Nahtnaught, Cursed Queen — Swordcraft follower, 4, 3/5. 荒野・指揮官.
// {[fanfare]} Search your deck for a 1-cost {[swordcraft]} card, put it into your EX area, then shuffle.
// {[act]} {[cost00]}: Select an enemy follower on the field and engage it. It becomes Boxed until the end
// of its controller's next turn. Activate only once per turn. (Boxed followers lose all abilities and
// don't refresh during the start phase — CR 5.31. An engaged one is Boxed all the same, and engaging
// it triggers "whenever this card becomes engaged" — rulings.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, isClass } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isClass("Swordcraft")(fx.game, id) && fx.game.info(id).cost === 1, { to: "ex" });
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.engage([target]);
          // Its controller is the opponent, whose next turn is the one after this one.
          yield* fx.box(target, "endOfOpponentsNextTurn");
        },
      },
    ),
  ],
});
