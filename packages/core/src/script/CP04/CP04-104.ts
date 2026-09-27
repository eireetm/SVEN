// CP04-104 Mimi (Evolved) — Havencraft, 3/3. プリコネ・リトルリリカル.
// {[ub]} On Evolve - {[engage]} X amulets on your field: Select up to X enemy followers on the field and deal them 2 damage. (X is
// determined before the selection, CR 10.6.2.2.4; selecting first and then engaging at least as many amulets gives the same
// choices. X = 0 is executed; not paying isn't — rulings. Executed by CP04-114, X is 0, CR 14.5.1.5.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { defineCard, onEvolve, ub } from "../helpers";
import { ANY, enemyFollower, isAmulet } from "../targets";

const reservedAmulets = (g: GameReader, c: PlayerId): CardId[] =>
  g.cards(c, "field").filter((id) => g.card(id)?.engaged === false && isAmulet(g, id));

/** "{[engage]} X amulets on your field": at least as many as the selected followers. */
const engageX: CustomCost = {
  canPay: () => true,
  *pay(fx) {
    const amulets = reservedAmulets(fx.game, fx.controller);
    const selected = fx.targets[0]?.length ?? 0;
    yield* fx.engage(yield* fx.chooseCards(amulets, Math.min(selected, amulets.length), amulets.length));
  },
};

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        cost: engageX,
        targets: [enemyFollower({ count: ANY, upTo: true, max: (g, c, _self, play) => (play?.free ? 0 : reservedAmulets(g, c).length) })],
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.targets[0]!, 2);
        },
      }),
    ),
  ],
});
