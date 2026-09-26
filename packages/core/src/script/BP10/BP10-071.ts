// BP10-071 Dragonclad Lancer — Dragoncraft follower, 3, 3/3. 竜使い・キラー.
// {[fanfare]} Select another follower on your field. Deal it 2 damage and give this follower
// {[attack]}+1/{[defense]}+1 and Rush. (The Chinese text gives the stats to the selected follower; the
// English and Japanese to this follower.)
// {[act]} {[cost03]}: Give this follower {[attack]}+1/{[defense]}+1 and Assail.
import { activated, defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
    activated(
      { playPoints: 3 },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "field") return;
          yield* fx.giveStats(fx.self, 1, 1);
          yield* fx.giveKeyword(fx.self, "assail");
        },
      },
    ),
  ],
});
