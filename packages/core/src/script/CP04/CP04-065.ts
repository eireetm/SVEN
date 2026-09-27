// CP04-065 Lind — Dragoncraft follower, 2, 2/3. プリコネ・〈ジオ・テオゴニア〉.
// {[ub]} Activate {[engage]} this: Select a Geo Theogonia follower on your field not named Lind. Give it {[attack]}+1/{[defense]}+1
// and refresh it. For the rest of this turn, it can't attack enemies. (Neither followers nor leaders — ruling.)
// Ward.
import { activated, defineCard, ub } from "../helpers";
import { named, yourFollower } from "../targets";
import { geoTheogonia } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          targets: [yourFollower({ filter: (g, id) => geoTheogonia(g, id) && !named("Lind")(g, id) })],
          *resolve(fx) {
            const target = fx.targets[0]![0]!;
            if (fx.game.card(target)?.zone !== "field") return;
            yield* fx.giveStats(target, 1, 1);
            yield* fx.refresh([target]);
            yield* fx.cannotAttack(target, "endOfTurn");
          },
        },
      ),
    ),
  ],
});
