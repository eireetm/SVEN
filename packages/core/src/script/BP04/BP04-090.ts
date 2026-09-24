// BP04-090 Grave Desecration — Abysscraft amulet, 1. 死者.
// (BP04-091 is the same card.)
// {[fanfare]} Put the top 2 cards of your deck into your cemetery.
// {[act]} {[cost02]}, {[engage]}, put this card into its owner's cemetery: Select a Departed
// follower in your cemetery and add it to your hand.
import { activated, defineCard, fanfare } from "../helpers";
import { hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        targets: [inYourZone("cemetery", { filter: (g, id) => isFollower(g, id) && hasTrait("死者")(g, id) })],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
        },
      },
    ),
  ],
});
