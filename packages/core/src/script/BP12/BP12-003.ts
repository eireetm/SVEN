// BP12-003 Elf Queen of Abundant Life (Evolved) — Forestcraft follower, 2/3. エルフ族.
// On Evolve - Select up to 2 enemy followers on the field and deal 2 damage divided between them. Combo
// (3) - Deal 4 damage divided between them instead. (Evolving is not playing a card: only the cards
// played this turn count — ruling. Each selected follower gets at least 1, BP08-028 ruling.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

const damage = (g: GameReader, p: PlayerId): number => (g.combo(p, 3) ? 4 : 2);

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0]!, damage(fx.game, fx.controller));
      },
    }),
  ],
});
