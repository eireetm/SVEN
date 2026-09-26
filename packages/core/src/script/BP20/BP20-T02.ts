// BP20-T02 Crest: Octrice, Hollowness Manifest — Swordcraft crest token. 絶傑・盗賊.
// At the start of your main phase or whenever you play or fuse a Loot card, put a reversal counter on this. If this has at
// least 8 reversal counters, banish this, search your deck for a Thief card, reveal it, add it to your hand, then shuffle.
// (Valid in the EX area, CR 10.3.6; the search too under the condition — Q10, as in English; "main phase" — the English,
// Japanese and official English texts, the Chinese one says end phase.)
import { atStartOfYourMainPhase, defineCard, whenYouPlayOrFuse, type TimingSpec } from "../helpers";
import { LOOT, thief } from "./shared";

const reversal: TimingSpec = {
  *resolve(fx) {
    if (fx.game.card(fx.self)?.zone !== "ex") return;
    yield* fx.addCounters(fx.self, "reversal", 1);
    if (fx.game.counters(fx.self, "reversal") < 8) return;
    yield* fx.banish([fx.self]);
    yield* fx.search((id) => thief(fx.game, id));
  },
};

export default defineCard({
  abilities: [atStartOfYourMainPhase(reversal), whenYouPlayOrFuse(reversal, LOOT)],
});
