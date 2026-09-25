// BP09-014 Elf General — Forestcraft follower, 5, 4/5. エルフ族.
// Ward.
// {[fanfare]} Summon 2 Fairy tokens. Give them {[attack]}+1/{[defense]}+1 and Ward.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const fairy of yield* fx.summon(["Fairy", "Fairy"])) {
          yield* fx.giveStats(fairy, 1, 1);
          yield* fx.giveKeyword(fairy, "ward");
        }
      },
    }),
  ],
});
