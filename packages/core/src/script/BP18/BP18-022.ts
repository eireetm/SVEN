// BP18-022 Gamma, Canine Mediator — Swordcraft follower, 3, 3/3. 透京・探偵・獣.
// {[fanfare]} Draw a card.
// Activate Remove 10 gigabyte counters from a Gigabyte Blade on your field: Deal 5 damage to each enemy follower on the
// field. Give this {[attack]}+2/{[defense]}+2 and Storm. (Not without the counters — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { drainBlade } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { custom: drainBlade },
      {
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 5);
          if (fx.game.card(fx.self)?.zone !== "field") return;
          yield* fx.giveStats(fx.self, 2, 2);
          yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});
