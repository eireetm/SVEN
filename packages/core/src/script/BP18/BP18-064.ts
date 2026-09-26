// BP18-064 Prophetic Dragon — Dragoncraft follower, 9, 5/6. 竜族.
// Ward.
// {[fanfare]} Select up to 2 cards in your cemetery named Prophetic Dragon and summon them.
// At the start of your end phase, select an enemy follower on the field. Deal it 5 damage and give your leader
// {[defense]}+1. (Without a target nothing happens — ruling.)
// {[act]} {[cost02]}, discard this: Draw a card. (Valid in the hand — ruling.)
import { discardThis } from "../costs";
import { activated, atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower, inYourZone, named } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { count: 2, upTo: true, filter: named("Prophetic Dragon") })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
    activated(
      { playPoints: 2, custom: discardThis },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
