// SD06-002 Hare of Illusions — Havencraft amulet, 0. 信仰.
// Activate {[engage]}, put this card into your cemetery: Select an enemy follower on the field and engage it. (Not without a
// follower to select; an engaged one may be selected and stays engaged — ruling.)
// {[act]} {[cost10]}, {[engage]}, put this card into your cemetery: Banish each follower on the field. (Both fields — ruling.)
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.engage(fx.targets[0]!);
        },
      },
    ),
    activated(
      { playPoints: 10, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          const opp = fx.game.opponent(fx.controller);
          yield* fx.banish([...fx.game.followers(fx.controller), ...fx.game.followers(opp)]);
        },
      },
    ),
  ],
});
