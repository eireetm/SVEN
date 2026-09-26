// BP11-032 Frontline Instructor — Swordcraft follower, 2, 2/3. 指揮官.
// {[fanfare]} {[costX]}: Summon X Steelclad Knight tokens. X equals a number of your choice. (Chosen as
// the Fanfare is played; 0 does nothing, so 1 or more is offered — ruling, like BP09-116.)
// Activate {[engage]}: For the rest of this turn, each {[swordcraft]} follower currently on your field
// has Rush and Assail. (Not followers put onto the field later — ruling.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { activated, defineCard, fanfare } from "../helpers";
import { isClass } from "../targets";

const playPointsOf = (g: GameReader, p: PlayerId) => g.state.players[p].playPoints;

export default defineCard({
  abilities: [
    fanfare({
      cost: {
        canPay: (g, c) => playPointsOf(g, c) >= 1,
        *pay(fx) {
          const most = playPointsOf(fx.game, fx.controller);
          const options = Array.from({ length: most }, (_, i) => ({ id: String(i + 1), label: `X = ${i + 1}` }));
          const [x] = yield* fx.choose(options);
          fx.memory.x = Number(x);
          yield* fx.payPlayPoints(Number(x));
        },
      },
      *resolve(fx) {
        const x = Number(fx.memory.x ?? 0);
        yield* fx.summon(Array.from({ length: x }, () => "Steelclad Knight"));
      },
    }),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          for (const id of fx.game.followers(fx.controller).filter((f) => isClass("Swordcraft")(fx.game, f))) {
            yield* fx.giveKeyword(id, "rush", "endOfTurn");
            yield* fx.giveKeyword(id, "assail", "endOfTurn");
          }
        },
      },
    ),
  ],
});
