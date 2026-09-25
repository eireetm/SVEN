// BP06-099 Boost Kicker — Havencraft follower, 2, 2/2. 信仰.
// {[fanfare]} {[costX]}: Deal X damage to each enemy follower on the field. X equals a number of
// your choice. (Any number — ruling; paying 0 would do nothing, so 1 or more is offered.)
// At the start of your end phase, recover 1 play point.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { playPointsOf } from "./shared";

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
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), Number(fx.memory.x ?? 0));
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
