// BP08-018 Aether of the Warrior Wing — Swordcraft follower, 3, 2/3. 指揮官・光輝.
// Fanfare: search for a Commander or Officer card. At the start of your end phase, if there are
// at least 7 Swordcraft followers in your cemetery, give each follower on your field +1/+1.
// CR 5.8, 10.7.2.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { hasTrait, isClass, isFollower } from "../targets";

const commanderOrOfficer = (g: GameReader, id: CardId) =>
  hasTrait("指揮官")(g, id) || hasTrait("兵士")(g, id);

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => commanderOrOfficer(fx.game, id));
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, p) =>
        g.cards(p, "cemetery").filter((id) => isFollower(g, id) && isClass("Swordcraft")(g, id)).length >= 7,
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
