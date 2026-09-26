// BP08-T01 Lloyd — Forestcraft token follower, 0, 2/4. 人形.
// Its name is also Puppet while on the field. Ward. Fanfare: leader +2 defense. CR 2.13, 5.27, 12.8.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  alsoNames: ["Puppet"],
  abilities: [fanfare({ *resolve(fx) { yield* fx.giveLeaderDefense(fx.controller, 2); } })],
});
