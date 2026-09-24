// BP04-121 Arriet, Soothing Harpist — Neutral follower, 5, 4/5. シンガー.
// {[fanfare]} Select an engaged follower on your field. Give it +2/+2 and refresh it. For the rest of
// this turn, it can't attack enemies.
import { defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower({ filter: (g, id) => g.card(id)?.engaged === true })],
      *resolve(fx) {
        const id = fx.targets[0]![0]!;
        yield* fx.giveStats(id, 2, 2);
        yield* fx.refresh([id]);
        yield* fx.cannotAttack(id, "endOfTurn");
      },
    }),
  ],
});
