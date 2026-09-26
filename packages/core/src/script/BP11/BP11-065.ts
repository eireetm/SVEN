// BP11-065 Wyrmfire Engineer — Dragoncraft follower, 1, 2/2. 荒野・竜族.
// {[lastwords]} Summon a Bullet Bike token.
import { defineCard, lastWords } from "../helpers";
import { BIKE } from "./shared";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.summon([BIKE]);
      },
    }),
  ],
});
