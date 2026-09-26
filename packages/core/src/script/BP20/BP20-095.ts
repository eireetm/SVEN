// BP20-095 Himeka, Heir to Repose (Evolved) — 3/3.
// On Evolve - Search your deck for a card with Omen and Zealot traits not named Himeka, Heir to Repose, reveal it, add it to
// your hand, then shuffle.
// On Super Evolve - {[cost02]}: Search your deck for a 4-cost or less follower with Omen and Zealot traits not named Himeka,
// Heir to Repose, summon it, then shuffle. (CR 10.4.7.4; 元のコスト.)
import { playPointsCost } from "../costs";
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { costAtMost, isFollower, named } from "../targets";
import { omenZealot } from "./shared";

const himeka = named("Himeka, Heir to Repose");

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => omenZealot(fx.game, id) && !himeka(fx.game, id));
      },
    }),
    onSuperEvolve({
      cost: playPointsCost(2),
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isFollower(g, id) && omenZealot(g, id) && !himeka(g, id) && costAtMost(4)(g, id), { to: "field" });
      },
    }),
  ],
});
