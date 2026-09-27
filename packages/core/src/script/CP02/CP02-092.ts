// CP02-092 Classroom Lily — Havencraft amulet, 3. デレマス・クール.
// {[fanfare]} Give your leader {[defense]}+2. Draw a card.
// {[q]}{[act]} {[cost02]}, {[engage]}, bury this card: Select an iM@S CG follower in your cemetery and add it to your hand.
// (A Quick activated ability, CR 12.3.3.)
import { activated, defineCard, fanfare } from "../helpers";
import { inYourZone } from "../targets";
import { followerThat, imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(1);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        quick: true,
        targets: [inYourZone("cemetery", { filter: followerThat(imas) })],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
        },
      },
    ),
  ],
});
