// BP20-001 Izudia, Annihilation Manifest — Forestcraft follower, 4, 3/5. 絶傑・狩人.
// {[fanfare]} Search your deck for a 2-cost or less spell with Omen and Hunter traits, reveal it, add it to your hand, then
// shuffle. If there are at least 6 Hunter cards in your cemetery, put an Annihilating Onslaught token into your EX area.
// {[act]} {[cost00]}: The next card with Omen and Hunter traits you play this turn costs 2 less to play. Activate only once
// per turn. (Two of these: 4 less — ruling. 元のコスト.)
import { activated, defineCard, fanfare } from "../helpers";
import { costAtMost, isSpell } from "../targets";
import { ANNIHILATING_ONSLAUGHT, huntersInCemetery, omenHunter } from "./shared";

export default defineCard({
  nextPlay: { omenHunter: (g, card) => omenHunter(g, card) },
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isSpell(g, id) && omenHunter(g, id) && costAtMost(2)(g, id));
        if (huntersInCemetery(g, fx.controller) >= 6) yield* fx.tokensToEx([ANNIHILATING_ONSLAUGHT]);
      },
    }),
    activated(
      { playPoints: 0 },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.nextPlayCostsLess("omenHunter", 2);
        },
      },
    ),
  ],
});
