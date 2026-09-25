// BP06-065 Jadelong Tactician — Dragoncraft follower, 5, 3/5. 竜使い.
// Storm.
// Strike - Select another follower on your field and give it {[attack]}+1/{[defense]}+1. If it's a
// Garyu, Supreme Dragonkin, give {[attack]}+2/{[defense]}+2 instead.
import { defineCard, strike } from "../helpers";
import { anotherYourFollower, named } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      targets: [anotherYourFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.card(target)?.zone !== "field") return;
        const n = named("Garyu, Supreme Dragonkin")(fx.game, target) ? 2 : 1;
        yield* fx.giveStats(target, n, n);
      },
    }),
  ],
});
