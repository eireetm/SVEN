// BP15-065 Whitefrost Blizzard — Dragoncraft spell, 4. ドラゴニュート.
// This costs 2 less to play if there's a follower on your field with "Filene" in its name.
// ----------
// Select any number of enemy followers on the field and deal X damage divided between them. X equals your max play
// points. (At least 1 each, so at most X are selected; none is allowed — BP04-001, BP08-028 rulings.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, spell } from "../helpers";
import { ANY, enemyFollower } from "../targets";
import { followerNamedOnField } from "./shared";

const x = (g: GameReader, p: PlayerId) => g.state.players[p].maxPlayPoints;

export default defineCard({
  playCost: (g, _self, p) => (followerNamedOnField(g, p, "Filene") ? -2 : 0),
  abilities: [
    spell({
      targets: [enemyFollower({ count: ANY, upTo: true, max: x })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], x(fx.game, fx.controller));
      },
    }),
  ],
});
