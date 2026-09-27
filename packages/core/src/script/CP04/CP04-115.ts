// CP04-115 Croce — Neutral follower, 1, 2/2. プリコネ・〈ジオ・テオゴニア〉.
// {[ub]}{[fanfare]} Place X battery counters on this. X equals your max play points.
// This can't have more than 7 battery counters. (Placing more gives 7; with 7 already, it is still executed — rulings.)
// Activate {[costX]}, engage this, remove X battery counters from this: Search your deck for a Geo Theogonia follower not named
// Croce that costs X or less, summon it, then shuffle. (元のコスト. X is paid as it resolves: nothing happens between playing and
// resolving an activated ability, CR 10.6.2.5.)
// (The scraped official English text belongs to another card.)
import { activated, defineCard, fanfare, ub } from "../helpers";
import { costAtMost, named } from "../targets";
import { followerThat, geoTheogonia } from "./shared";

const BATTERY = "battery";
const MAX_BATTERY = 7;

export default defineCard({
  abilities: [
    ub(
      fanfare({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "field") return;
          const room = MAX_BATTERY - fx.game.counters(fx.self, BATTERY);
          const x = Math.min(fx.game.state.players[fx.controller].maxPlayPoints, room);
          if (x > 0) yield* fx.addCounters(fx.self, BATTERY, x);
        },
      }),
    ),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          const g = fx.game;
          const most = Math.min(g.state.players[fx.controller].playPoints, g.counters(fx.self, BATTERY));
          const options = Array.from({ length: most + 1 }, (_, x) => ({ id: String(x), label: `X = ${x}` }));
          const [pick] = yield* fx.choose(options);
          const x = Number(pick ?? 0);
          yield* fx.payPlayPoints(x);
          if (x > 0) yield* fx.removeCounters(fx.self, BATTERY, x);
          yield* fx.search((id) => followerThat(geoTheogonia)(g, id) && !named("Croce")(g, id) && costAtMost(x)(g, id), { to: "field" });
        },
      },
    ),
  ],
});
