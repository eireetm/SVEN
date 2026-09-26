// BP21-061 Dion, Scarlet Scion — Dragoncraft follower, 2, 3/1. ドラゴニュート・学院.
// Rush. Assail.
// Strike - If there's a card in your EX area with at least 4 passion counters, increase your max play points by 1. If it
// has at least 10, give this {[defense]}+6.
import { defineCard, strike } from "../helpers";
import { passionInEx } from "./shared";
import { tenPassionDefense } from "./shared-dragon";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    strike({
      *resolve(fx) {
        if (passionInEx(fx.game, fx.controller) >= 4) yield* fx.increaseMaxPlayPoints(1);
        yield* tenPassionDefense(fx);
      },
    }),
  ],
});
