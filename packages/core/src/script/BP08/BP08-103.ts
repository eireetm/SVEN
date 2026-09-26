// BP08-103 Alterplane Arbiter — Neutral follower, 5, 5/5. 大神.
// Evolve (2). Fanfare: declare any number, mill 5, then deal X to every enemy follower, where X
// is the number milled with that printed cost. Declarations outside the database's cost range are
// represented by one equivalent option because none can match (CR 1.3.2, 5.14, 5.34).
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        const maxCost = Math.max(0, ...fx.game.db.all().map((d) => d.cost ?? 0));
        const options = Array.from({ length: maxCost + 1 }, (_, n) => ({ id: String(n), label: String(n) }));
        options.push({ id: "other", label: `Any other number (greater than ${maxCost})` });
        const [pick] = yield* fx.choose(options);
        const declared = pick === "other" ? -1 : Number(pick);
        const milled = yield* fx.mill(5);
        const x = milled.filter((id) => fx.game.info(id).cost === declared).length;
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), x);
      },
    }),
  ],
});
