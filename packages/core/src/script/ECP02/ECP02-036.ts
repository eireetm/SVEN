// ECP02-036 Tomoe Murakami [Crimson Fighter] — Runecraft follower, 3, 3/4. デレマス・パッション.
// {[fanfare]} The next Passion spell that costs 3 or less you play this turn costs 3 less. (元のコスト. An increase after it still
// applies — ruling.)
// Once per turn, when you play a Passion spell, deal 2 damage to each enemy leader. (On the opponent's turn too — ruling.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { costAtMost, isSpell } from "../targets";
import { damageEnemyLeader, passion } from "./shared";

const NEXT = "passionSpell";
const passionSpell = (g: Parameters<typeof passion>[0], id: string) => isSpell(g, id) && passion(g, id);

export default defineCard({
  nextPlay: { [NEXT]: (g, card) => passionSpell(g, card) && costAtMost(3)(g, card) },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.nextPlayCostsLess(NEXT, 3);
      },
    }),
    whenYouPlay(
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* damageEnemyLeader(fx, 2);
        },
      },
      passionSpell,
    ),
  ],
});
