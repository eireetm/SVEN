// BP04-001 Cassiopeia — Forestcraft follower, 5, 4/5. 精霊・星神.
// {[fanfare]} Select any number of enemy followers on the field and deal X damage divided between
// them. X equals the total number of cards in your hand and EX area.
// Selecting none is allowed and one follower may get more than its defense (rulings). Each
// selected follower gets at least 1 (rulings BP08-028 / EBD02-015), so at most X are selected.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare } from "../helpers";
import { ANY, enemyFollower } from "../targets";

const x = (g: GameReader, p: PlayerId) => g.cards(p, "hand").length + g.cards(p, "ex").length;

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower({ count: ANY, upTo: true, max: x })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], x(fx.game, fx.controller));
      },
    }),
  ],
});
