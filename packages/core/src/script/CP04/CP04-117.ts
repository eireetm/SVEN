// CP04-117 Kasumi (Evolved) — Neutral, 2/4. プリコネ・カォン.
// {[ub]} On Evolve - Select an enemy follower on the field and engage it. It doesn't refresh during its controller's next start
// phase. (Also an engaged one: then only the rest applies — ruling.)
// (The scraped official English text belongs to another card.)
import { defineCard, onEvolve, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.engage([target]);
          yield* fx.skipNextRefresh(target);
        },
      }),
    ),
  ],
});
