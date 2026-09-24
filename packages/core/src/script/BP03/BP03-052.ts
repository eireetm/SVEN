// BP03-052 Magical Bishop — Runecraft follower, 2, 1/2. チェス.
// {[fanfare]} Put a Magical Pawn into your EX area.
// At the start of your end phase, if another Chess follower is on your field, deal 1 to the
// enemy leader and give your leader +1 defense.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Magical Pawn"]);
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        const another = fx.game.followers(fx.controller).some((id) => id !== fx.self && hasTrait("チェス")(fx.game, id));
        if (!another) return;
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
