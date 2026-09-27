// CP01-035 Admire Vega — Runecraft follower, 2, 2/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Activate {[engage]}: Select a spell that costs 2 play points or less in your hand and put it into your EX area. For the rest
// of this turn, it costs 0 play points to play. (With a full EX area it stays in the hand at its cost — ruling; CR 4.1.2.2.)
import { activated, defineCard, serveAbility } from "../helpers";
import { costAtMost, inYourZone, isSpell } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    activated(
      { engageSelf: true },
      {
        targets: [inYourZone("hand", { filter: (g, id) => isSpell(g, id) && costAtMost(2)(g, id) })],
        *resolve(fx) {
          for (const id of yield* fx.putIntoEx(fx.targets[0] ?? [])) yield* fx.setPlayCost(id, 0, "endOfTurn");
        },
      },
    ),
  ],
});
