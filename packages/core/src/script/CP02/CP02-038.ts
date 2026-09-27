// CP02-038 Syuko Shiomi — Runecraft follower, 9, 3/3. デレマス・クール.
// When playing this card, discard 3 iM@S CG cards: This card costs 6 less to play. (From the hand; not this card, which is in
// the resolution zone when costs are paid, CR 10.6.2.1.)
// ----------
// {[fanfare]} Select an enemy follower on the field. Deal it 4 damage and draw 2 cards. (Without an enemy follower nothing
// happens, not even the draw — ruling, CR 10.6.2.3.3.)
import { discardMatching } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { imas } from "./shared";

export default defineCard({
  playOptions: [{ id: "discard3", label: "Discard 3 iM@S CG cards: costs 6 less", costDelta: -6, ...discardMatching(imas, 3) }],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.draw(2);
      },
    }),
  ],
});
