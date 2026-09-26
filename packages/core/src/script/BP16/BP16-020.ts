// BP16-020 Amelia, Silver Captain (Evolved) — Swordcraft follower, 3/3. 指揮官.
// On Evolve - Put the top card of your deck into your EX area.
// On Super-Evolve - Select an Officer follower on your field and give it {[attack]}+4/{[defense]}+4.
// At the start of your end phase, you may put a Steelclad Knight, Shield Guardian, or Knight token into your EX
// area.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { yourFollower } from "../targets";
import { officer } from "./shared";
import { ameliaSupplies } from "./shared-sword";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.topToEx(1);
      },
    }),
    onSuperEvolve({
      targets: [yourFollower({ filter: officer })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 4, 4);
      },
    }),
    ameliaSupplies,
  ],
});
