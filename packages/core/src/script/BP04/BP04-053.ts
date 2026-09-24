// BP04-053 Mage of Nightfall — Runecraft follower, 3, 3/3. 魔法使い.
// Intimidate.
// {[fanfare]}, Earth Rite: Give this follower +2/+1.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["intimidate"],
  abilities: [
    fanfare({
      earthRite: { mode: "required" },
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 2, 1);
      },
    }),
  ],
});
