// BP16-011 Bayle, Luxglaive Warrior — Forestcraft follower, 3, 4/4. 狩人・獣.
// This can't be played unless a follower you control has left the field this turn.
// ----------
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  playableIf: (g, _self, p) => g.cardsLeftFieldThisTurn(p).some((c) => c.type === "follower"),
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
