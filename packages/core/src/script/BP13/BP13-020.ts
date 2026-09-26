// BP13-020 Albert, Thunderous Doom (Evolved) — Swordcraft follower, 4/6. 指揮官・レヴィオン・キラー.
// Storm.
// Strike - Select up to 1 enemy follower on the field and destroy it. Give this follower {[attack]}+X/
// {[defense]}+X, where X equals the number of followers that were put from the field into the cemetery
// this turn. (Any player's, counted after the destroy; playable with nothing selected — ruling.)
// {[act]} {[cost02]}: Refresh this follower. Activate only if there are at least 10 Levin cards in your
// cemetery.
import { activated, defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, levin } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      targets: [enemyFollower({ count: 1, upTo: true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
        const x = fx.game.followersToCemeteryThisTurn(fx.controller) + fx.game.followersToCemeteryThisTurn(fx.game.opponent(fx.controller));
        if (x > 0 && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, x, x);
      },
    }),
    activated(
      { playPoints: 2 },
      {
        condition: (g, c) => countIn(g, c, "cemetery", levin) >= 10,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.refresh([fx.self]);
        },
      },
    ),
  ],
});
