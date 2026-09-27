// CSD02c-004 Kaoru Ryuzaki — Dragoncraft follower, 1, 2/2. デレマス・パッション.
// {[act]} {[cost02]}: If there are at least 5 Passion cards in your cemetery, select a follower in your cemetery and add it to your
// hand. Activate only once per turn.
import { activated, defineCard } from "../helpers";
import { inYourZone, isFollower } from "../targets";
import { inYourCemetery, passion } from "../CP02/shared";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 2 },
      {
        oncePerTurn: true,
        targets: [inYourZone("cemetery", { filter: isFollower, when: (g, c) => inYourCemetery(g, c, passion) >= 5 })],
        *resolve(fx) {
          const card = fx.targets[0]?.[0];
          if (card !== undefined) yield* fx.returnToHand([card]);
        },
      },
    ),
  ],
});
