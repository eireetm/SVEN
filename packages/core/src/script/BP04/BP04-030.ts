// BP04-030 Lord General Romeo — Swordcraft follower, 3, 3/4. 指揮官・プリンス.
// If there is a Princess Juliet on your field, this card costs 2 less to play (2 less even with
// two of them — ruling).
// Ward.
// At the start of your end phase, if there is a Princess Juliet on your field, give your leader
// +2 defense.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { named } from "../targets";

const juliet = (g: GameReader, p: PlayerId) => g.followers(p).some((id) => named("Princess Juliet")(g, id));

export default defineCard({
  keywords: ["ward"],
  playCost: (g, _self, p) => (juliet(g, p) ? -2 : 0),
  abilities: [
    atStartOfYourEndPhase({
      condition: juliet,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
