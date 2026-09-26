// BP04-007 Fashionista Nelcha — Forestcraft follower, 2, 2/3. エルフ族.
// Activate {[engage]}: Combo (3): Choose one of the following. (1) Select another follower on your
// field and give it +2/+2. (2) Select an enemy follower on the field and give it -2/-2.
// Combo is a condition on the effect (CR 13.2.1.2), so without Combo (3) it can still be activated
// and does nothing. The option and its target are
// chosen as it resolves (nothing can happen in between); only options that can be performed are
// offered (CR 5.18.3.1.2), and an enemy follower with Aura cannot be selected (CR 12.15).
import type { CardId } from "../../model/ids";
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          if (!fx.game.combo(fx.controller, 3)) return;
          const mine = fx.game.followers(fx.controller).filter((id) => id !== fx.self);
          const enemies = fx.game.followers(fx.game.opponent(fx.controller)).filter((id) => fx.game.canSelect(id, fx.controller));
          const options = [
            ...(mine.length > 0 ? [{ id: "buff", label: "Another follower of yours gets +2/+2" }] : []),
            ...(enemies.length > 0 ? [{ id: "weaken", label: "An enemy follower gets -2/-2" }] : []),
          ];
          if (options.length === 0) return;
          // Any number of them instead with BP20-T06 (CR 5.18), in listed order (10.6.2.8.2.2).
          const modes = yield* fx.choose(options, 1, fx.game.choosesAnyNumberOfOptions(fx.controller) ? options.length : 1);
          const targets: CardId[] = [];
          for (const mode of modes) targets.push(...(yield* fx.selectCards(mode === "buff" ? mine : enemies, 1, 1)));
          for (const [i, mode] of modes.entries()) {
            const id = targets[i];
            if (id === undefined) continue;
            if (mode === "buff") yield* fx.giveStats(id, 2, 2);
            else yield* fx.giveStats(id, -2, -2);
          }
        },
      },
    ),
  ],
});
