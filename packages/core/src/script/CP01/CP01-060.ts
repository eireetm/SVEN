// CP01-060 My Solo Drawn to Raindrop Drums — Abysscraft spell, 4. ウマ娘.
// {[quick]}
// If there are at least 10 Umamusume cards in your cemetery, this card costs 2 less to play. (「自分の墓場」; the English
// "the cemetery" — the Japanese resolves it.)
// Select an enemy follower on the field and destroy it.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { umamusumeInCemetery } from "./shared";

export default defineCard({
  keywords: ["quick"],
  playCost: (g, _self, controller) => (umamusumeInCemetery(g, controller) >= 10 ? -2 : 0),
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
