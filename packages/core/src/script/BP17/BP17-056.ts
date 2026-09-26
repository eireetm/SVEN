// BP17-056 Valdain, Forest Shadow — Dragoncraft follower, 6, 5/5. 自然・ドラゴニュート.
// Rush.
// {[fanfare]} Banish X cards named Naterran Great Tree from your field: Choose up to X. (1) Select an enemy follower on the
// field and destroy it. (2) Search your deck for up to 2 Natura spells with different names, put them into your EX area,
// then shuffle. (3) Give your leader {[defense]}+2.
// (X is the player's choice, e.g. 4, but at most 3 options, each once; (1) needs its target; the target is selected
// before the banished trees' "leaves the field" abilities — rulings. Paying is optional, CR 10.4.7.4: X = 0 does
// nothing. The whole fanfare runs as it resolves: nothing else happens in between.)
import { defineCard, fanfare } from "../helpers";
import { isSpell } from "../targets";
import { isTree, natura } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const trees = g.cards(fx.controller, "field").filter((id) => isTree(g, id));
        if (trees.length === 0) return;
        const [xs] = yield* fx.choose(Array.from({ length: trees.length + 1 }, (_, x) => ({ id: String(x), label: `X = ${x}` })));
        const x = Number(xs ?? 0);
        if (x === 0) return;
        const enemies = g.followers(g.opponent(fx.controller)).filter((id) => g.canSelect(id, fx.controller));
        const options = [
          ...(enemies.length > 0 ? [{ id: "destroy", label: "(1) Destroy an enemy follower" }] : []),
          { id: "search", label: "(2) Up to 2 Natura spells with different names into your EX area" },
          { id: "leader", label: "(3) Leader +2" },
        ];
        // Any number of them instead with BP20-T06 (CR 5.18).
        const modes = yield* fx.choose(options, 1, fx.game.choosesAnyNumberOfOptions(fx.controller) ? options.length : Math.min(x, options.length));
        const target = modes.includes("destroy") ? yield* fx.selectCards(enemies, 1, 1) : [];
        yield* fx.banish(yield* fx.chooseCards(trees, x, x));
        if (modes.includes("destroy")) yield* fx.destroy(target);
        if (modes.includes("search")) {
          yield* fx.search((id) => isSpell(g, id) && natura(g, id), { max: 2, distinctNames: true, to: "ex" });
        }
        if (modes.includes("leader")) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
