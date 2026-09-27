// CP01-047 Flowers for You — Dragoncraft spell, 1. ウマ娘.
// Select an Umamusume follower on your field. Give it {[attack]}+1 and draw a card. If the selected follower is a Seiun Sky,
// give it {[attack]}+1/{[defense]}+1 more. (The selected follower, not the drawn card; in that order — rulings.)
import { defineCard, spell } from "../helpers";
import { named, yourFollower } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: umamusume })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveStats(target, 1, 0);
        yield* fx.draw(1);
        if (fx.game.card(target)?.zone === "field" && named("Seiun Sky")(fx.game, target)) yield* fx.giveStats(target, 1, 1);
      },
    }),
  ],
});
