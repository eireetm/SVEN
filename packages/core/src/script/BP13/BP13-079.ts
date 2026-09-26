// BP13-079 Liberté, Unchained Wolf (Evolved) — Abysscraft follower, 3/3. 獣・キラー.
// On Evolve - Select an enemy follower on the field and deal it 3 damage. If a follower was put from your
// field into the cemetery this turn, deal 4 damage instead and draw a card. (The draw is part of the "if"
// in the English text; the Japanese text has it as a sentence of its own. Not played without a target —
// ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.followersToCemeteryThisTurn(fx.controller) === 0) {
          yield* fx.dealDamage(target, 3);
          return;
        }
        yield* fx.dealDamage(target, 4);
        yield* fx.draw(1);
      },
    }),
  ],
});
