// BP18-029 Cold Case Analyst (Evolved) — 4/2.
// Assail.
// Strike - Place 2 gigabyte counters on each Gigabyte Blade on your field.
// (effect_en says "On Evolve"; the official English, Japanese 【攻撃時】 and Chinese 【攻击时】 all say Strike: the majority is
// implemented — reported to the user.)
import { defineCard, strike } from "../helpers";
import { chargeBlades } from "./shared";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* chargeBlades(fx, 2);
      },
    }),
  ],
});
