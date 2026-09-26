// BP21-069 Megalorca Rider — Dragoncraft follower, 1, 1/1. 海洋・学院.
// Ward.
// {[lastwords]} Draw a card.
// Activate {[engage]} this: If there's a card in your EX area with at least 4 passion counters, give your leader
// {[defense]}+2. If it has at least 10, give this {[defense]}+6.
import { activated, defineCard, lastWords } from "../helpers";
import { passionInEx } from "./shared";
import { tenPassionDefense } from "./shared-dragon";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          if (passionInEx(fx.game, fx.controller) >= 4) yield* fx.giveLeaderDefense(fx.controller, 2);
          yield* tenPassionDefense(fx);
        },
      },
    ),
  ],
});
