// BP21-T06 Lilium's Hatchling — Dragoncraft follower token, 1, 1/1. 竜族・学院.
// Ward.
// {[lastwords]} Give your leader {[defense]}+1.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
