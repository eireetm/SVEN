// BP01-078 Zirnitra — Dragoncraft follower, 3, 3/2.
// {[fanfare]} Put a Dragon token into your EX area.
// {[act]}{[cost02]}, {[engage]}: Select a Dragon token in your EX area. Put it onto your field and
// give it Rush. If Overflow is active for you, recover 2 play points (not above the maximum —
// ruling).
import { activated, defineCard, fanfare } from "../helpers";
import { and, inYourZone, isToken, named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Dragon"]);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true },
      {
        targets: [inYourZone("ex", { filter: and(isToken, named("Dragon")) })],
        *resolve(fx) {
          for (const dragon of yield* fx.putOntoField(fx.targets[0]!)) yield* fx.giveKeyword(dragon, "rush");
          if (fx.game.overflow(fx.controller)) yield* fx.recoverPlayPoints(2);
        },
      },
    ),
  ],
});
