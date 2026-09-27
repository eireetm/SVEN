// ECP01-023 Verxina — Runecraft follower, 4, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// Ward.
// {[fanfare]} Discard an Umamusume card: Deal 2 damage to each enemy leader. Give your leader {[defense]}+2. Draw 2 cards.
// Whenever a Cheval Grand or Vivlos is put onto your field, select an enemy follower on the field and deal it 2 damage. (Each
// copy triggers, once per card; also when this enters with it, and on the opponent's turn — rulings.)
import { discardA } from "../costs";
import { defineCard, fanfare, serveAbility, whenCardEntersYourField } from "../helpers";
import { enemyFollower, named } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      cost: discardA(umamusume),
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(2);
      },
    }),
    whenCardEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      { filter: (g, id) => named("Cheval Grand")(g, id) || named("Vivlos")(g, id) },
    ),
  ],
});
