// CSD02c-001 Mio Honda [Positive Passion] — Swordcraft follower, 6, 5/5. デレマス・パッション.
// Rush.
// {[fanfare]} Look at the top 2 cards of your deck. You may summon a Passion follower from among them. Bury the rest.
// {[act]} {[cost02]}, Lesson (2): Look at the top 2 cards of your deck. You may summon a Passion follower from among them. Bury the
// rest.
import type { EffectContext } from "../../engine/effects/context";
import { lesson } from "../costs";
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { followerThat, passion } from "../CP02/shared";

function* summonFromTopTwo(fx: EffectContext) {
  yield* lookAtTopCards(fx, 2, { filter: followerThat(passion), to: "field", rest: "cemetery" });
}

export default defineCard({
  keywords: ["rush"],
  abilities: [fanfare({ resolve: summonFromTopTwo }), activated({ playPoints: 2, custom: lesson(2) }, { resolve: summonFromTopTwo })],
});
