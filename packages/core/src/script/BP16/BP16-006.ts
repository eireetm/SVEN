// BP16-006 Glade, Fragrantwood Ward (Evolved) — Forestcraft follower, 4/4. エルフ族・狩人.
// On Evolve - Draw a card. Summon 2 Fairy tokens.
// On Super-Evolve - Select any number of enemy followers on the field and deal X damage divided between them. X
// equals the total number of cards on your field and in your hand. (At least 1 each, so at most X — BP04-001.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { ANY, enemyFollower } from "../targets";
import { FAIRY } from "./shared";

const x = (g: GameReader, p: PlayerId) => g.cards(p, "field").length + g.cards(p, "hand").length;

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.summon([FAIRY, FAIRY]);
      },
    }),
    onSuperEvolve({
      targets: [enemyFollower({ count: ANY, upTo: true, max: x })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], x(fx.game, fx.controller));
      },
    }),
  ],
});
