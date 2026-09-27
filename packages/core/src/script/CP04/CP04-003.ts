// CP04-003 Eris — Forestcraft follower, 4, 4/3. プリコネ.
// {[ub]} Activate {[engage]} this: Select another PriConne follower on your field. Give it {[attack]}+1/{[defense]}+1 and, if
// {[ub]} abilities you control have executed at least 3 other times this turn, give it Storm. (これを含めず: its 4th execution
// of the turn meets it; one executed by CP04-114 counts CP04-114's own — rulings.)
// {[fanfare]} Look at the top 4 cards of your deck. You may reveal a PriConne card from among them and add it to your hand. Put
// the rest on the bottom of your deck in any order. The next PriConne card you play this turn costs 2 less.
import { activated, defineCard, fanfare, lookAtTopCards, ub } from "../helpers";
import { anotherYourFollower } from "../targets";
import { otherUnionBursts, priconne } from "./shared";

export default defineCard({
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          targets: [anotherYourFollower({ filter: priconne })],
          *resolve(fx) {
            const target = fx.targets[0]![0]!;
            if (fx.game.card(target)?.zone !== "field") return;
            yield* fx.giveStats(target, 1, 1);
            if (otherUnionBursts(fx) >= 3) yield* fx.giveKeyword(target, "storm");
          },
        },
      ),
    ),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: priconne, to: "hand" });
        yield* fx.nextPlayCostsLess("priconne", 2);
      },
    }),
  ],
  nextPlay: { priconne: (g, card) => priconne(g, card) },
});
