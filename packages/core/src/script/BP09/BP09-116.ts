// BP09-116 Valkyrie of Order — Neutral follower, 1, 2/1. 天使・光輝.
// {[fanfare]}, {[costX]}: Give this follower {[attack]}+X/{[defense]}+X, where X equals a number of your
// choice. (X is chosen as the Fanfare is played and may be 0 — ruling; paying 0 would do nothing, so 1
// or more is offered, like BP06-099.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare } from "../helpers";

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
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, x, x);
      },
    }),
  ],
});
