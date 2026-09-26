// BP15-046 Secrets of Onmyodo — Runecraft spell, 0. 挑戦者・陰陽師.
// As an additional cost to play this, reveal 2 Onmyoji cards from your hand.
// ----------
// {[costX]}: Search your deck for an Onmyoji follower that costs X or less, summon it, then shuffle. If there are
// at least 7 spells and/or Onmyoji cards in your cemetery, put a Paper Shikigami token into your EX area and give
// it "This costs 1 less to play." X equals a number of your choice.
// (元のコスト. X may be 0; the token comes even if no follower is found; a card that is both counts once —
// rulings. The play points are an optional process as the spell resolves, CR 10.4.7.2, 10.4.7.5; nothing
// happens between playing and resolving it, so choosing X then is the same as choosing it when playing.)
import type { CustomCost } from "../types";
import { revealFromHand } from "../costs";
import { defineCard, spell } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { PAPER_SHIKIGAMI, onmyoji, spellsOrOnmyojiInCemetery } from "./shared";

/** "{[costX]}": choose X, pay X play points. */
const payX: CustomCost = {
  canPay: () => true,
  *pay(fx) {
    const pp = fx.game.state.players[fx.controller].playPoints;
    const options = Array.from({ length: pp + 1 }, (_, x) => ({ id: String(x), label: `X = ${x}` }));
    const [x] = yield* fx.choose(options);
    fx.memory.x = Number(x ?? 0);
    yield* fx.payPlayPoints(Number(x ?? 0));
  },
};

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "reveal2", label: "Reveal 2 Onmyoji cards from your hand", ...revealFromHand(onmyoji, 2) }],
  abilities: [
    spell({
      *resolve(fx) {
        if (!(yield* fx.optionalCost(payX))) return;
        const x = Number(fx.memory.x ?? 0);
        yield* fx.search((id) => and(isFollower, onmyoji, costAtMost(x))(fx.game, id), { to: "field" });
        if (spellsOrOnmyojiInCemetery(fx.game, fx.controller) < 7) return;
        for (const id of yield* fx.tokensToEx([PAPER_SHIKIGAMI])) yield* fx.changePlayCost(id, -1);
      },
    }),
  ],
});
