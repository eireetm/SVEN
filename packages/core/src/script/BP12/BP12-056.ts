// BP12-056 Steelcap Pachycephalosaurus (Evolved) — Dragoncraft follower, 3/3. 自然・竜族.
// On Evolve - Select an enemy follower on the field and deal it 2 damage. If you've discarded a card this
// turn, deal 4 damage instead.
// {[lastwords]} Summon a Naterran Great Tree token.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { summonTreeLastWords } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.discardedThisTurn(fx.controller) > 0 ? 4 : 2);
      },
    }),
    summonTreeLastWords,
  ],
});
