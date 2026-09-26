// BP11-074 Greatpick Corpse — Abysscraft follower, 3, 3/3. 荒野・死者.
// {[fanfare]} Bury another card: Select an enemy follower on the field and deal it 4 damage.
// Once per turn, when a 1-cost token card you control leaves the field, summon a token of the same
// name. (Also during the opponent's turn; each Greatpick once; of several leaving together the player
// chooses one; a card that is only also named like a token doesn't count — rulings.)
import type { CardMove } from "../../events/types";
import type { GameReader } from "../../engine/query";
import { buryAnotherFromYourField } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import type { AutomaticAbility } from "../types";

/** A 1-cost token (元のコスト 1) that left `player`'s field. */
const leftAsCheapToken = (m: CardMove, g: GameReader, player: number): boolean => {
  const d = g.db.get(m.def);
  return m.from?.zone === "field" && m.to.zone !== "field" && m.before?.controller === player && d.token && d.cost === 1;
};

const sameNameToken: AutomaticAbility = {
  kind: "automatic",
  timing: "other",
  oncePerTurn: true,
  // Once per batch of cards leaving together: which one is chosen when it resolves.
  trigger: (e, me, game) => me.zone === "field" && e.type === "cardsMoved" && e.moves.some((m) => leftAsCheapToken(m, game, me.controller)),
  *resolve(fx) {
    const e = fx.event;
    if (e?.type !== "cardsMoved") return;
    const names = [...new Set(e.moves.filter((m) => leftAsCheapToken(m, fx.game, fx.controller)).map((m) => fx.game.db.get(m.def).name))];
    let name = names[0];
    if (names.length > 1) {
      const [pick] = yield* fx.choose(names.map((n) => ({ id: n, label: `Summon a ${n}` })));
      name = pick;
    }
    if (name !== undefined) yield* fx.summon([name]);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      cost: buryAnotherFromYourField(() => true),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    sameNameToken,
  ],
});
