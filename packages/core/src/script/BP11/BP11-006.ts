// BP11-006 Giant Pastures — Forestcraft follower, 6, 5/6. 荒野・植物族.
// {[fanfare]} Put a Bullet Bike and Arcane Personnel Carrier token into your EX area. Deal each enemy
// leader and enemy follower on the field damage equal to the number of Mount cards in your EX area.
// (With room for one, the player chooses which — ruling.)
import { defineCard, fanfare } from "../helpers";
import { BIKE, CARRIER, mount } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([BIKE, CARRIER]);
        const n = fx.game.cards(fx.controller, "ex").filter((id) => mount(fx.game, id)).length;
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach([fx.game.leader(opponent), ...fx.game.followers(opponent)], n);
      },
    }),
  ],
});
