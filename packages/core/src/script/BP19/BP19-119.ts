// BP19-119 Warden of Recurrence — Neutral follower, 8, 4/4. 八獄・天使.
// Ward.
// {[fanfare]} Choose 1. (1) Search your deck for a Zerael, Regent of Rebirth, summon it, then shuffle. (2) Recover 8 play
// points.
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";

const rebirth = named("Zerael, Regent of Rebirth");

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      modes: [
        {
          id: "zerael",
          label: "(1) Summon a Zerael, Regent of Rebirth from your deck",
          *resolve(fx) {
            yield* fx.search((id) => rebirth(fx.game, id), { to: "field" });
          },
        },
        {
          id: "pp",
          label: "(2) Recover 8 play points",
          *resolve(fx) {
            yield* fx.recoverPlayPoints(8);
          },
        },
      ],
    }),
  ],
});
