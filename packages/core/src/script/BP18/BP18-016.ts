// BP18-016 Milolo, Li'l Mountain Lass — Forestcraft follower, 3, 3/3. 狩人.
// {[fanfare]} The next spell that costs 1 or less you play this turn costs 1 less. (Original cost, 元のコスト.)
// Once per turn, when you play a spell, select a follower on your field and give it {[attack]}+1/{[defense]}+1 and Rush.
// (During the opponent's turn too; a spell returning this still triggers it — rulings.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { isSpell, yourFollower } from "../targets";

export default defineCard({
  nextPlay: { cheapSpell: (g, card) => isSpell(g, card) && (g.info(card).cost ?? Infinity) <= 1 },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.nextPlayCostsLess("cheapSpell", 1);
      },
    }),
    whenYouPlay(
      {
        oncePerTurn: true,
        targets: [yourFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.giveStats(target, 1, 1);
          yield* fx.giveKeyword(target, "rush");
        },
      },
      isSpell,
    ),
  ],
});
