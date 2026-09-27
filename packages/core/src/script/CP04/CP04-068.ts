// CP04-068 Mifuyu (Evolved) — Dragoncraft, 3/4. プリコネ・メルクリウス財団.
// {[ub]} On Evolve - Select an enemy amulet on the field and destroy it. (Without one it isn't executed — ruling.)
// Ward.
import { defineCard, onEvolve, ub } from "../helpers";
import { enemyCardOnField, isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      onEvolve({
        targets: [enemyCardOnField({ filter: isAmulet })],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      }),
    ),
  ],
});
