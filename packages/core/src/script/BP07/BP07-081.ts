// BP07-081 Bone Drone — Abysscraft follower, 2, 2/2. 機械・死者.
// {[lastwords]} Summon an Assembly Droid token.
import { defineCard, lastWords } from "../helpers";
import { DROID } from "./shared";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.summon([DROID]);
      },
    }),
  ],
});
