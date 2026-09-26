// BP16-098 Ronavero, Darkhaven Ward (Evolved) — Havencraft follower, 4/4. 信仰・先導.
// On Evolve - Select an enemy follower on the field. Change its attack to 0 and its defense to 1, and engage it. (A
// follower with 0 attack is engaged too — ruling.)
// On Super-Evolve - Select a Faith spell or Faith amulet in your cemetery that costs 4 or less and put it into your EX
// area. It costs 4 less to play this turn. (元のコスト.)
import { changeStatsTo, defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { and, costAtMost, enemyFollower, inYourZone, isAmulet, isSpell } from "../targets";
import { faith } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* changeStatsTo(fx, target, { attack: 0, defense: 1 });
        if (fx.game.card(target)?.zone === "field") yield* fx.engage([target]);
      },
    }),
    onSuperEvolve({
      targets: [inYourZone("cemetery", { filter: and(faith, costAtMost(4), (g, id) => isSpell(g, id) || isAmulet(g, id)) })],
      *resolve(fx) {
        for (const id of yield* fx.putIntoEx(fx.targets[0]!)) yield* fx.changePlayCost(id, -4, "endOfTurn");
      },
    }),
  ],
});
