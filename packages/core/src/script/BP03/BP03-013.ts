// BP03-013 Fen Sprite — Forestcraft follower, 3, 4/3. 精霊.
// {[fanfare]} Select an enemy follower. During its controller's next turn, it can't attack
// enemies (CR 8.4.3.2.1 — no enemy follower and no enemy leader).
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.cannotAttack(fx.targets[0]![0]!, "endOfOpponentsNextTurn");
      },
    }),
  ],
});
