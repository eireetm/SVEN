// BP16-077 Aragavy, Eternal Hunter (Evolved) — Abysscraft follower, 5/5. 挑戦者・獣.
// On Evolve - Select up to 3 enemy followers on the field and deal 5 damage divided between them. If your leader's
// defense is 10 or less, deal 10 damage divided between them instead. (At least 1 each — BP04-001.)
// On Super-Evolve - Give this Storm.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";

const x = (g: GameReader, p: PlayerId) => (g.state.players[p].leaderDefense <= 10 ? 10 : 5);

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ count: 3, upTo: true, max: x })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], x(fx.game, fx.controller));
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
