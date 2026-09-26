// BP16-093 Lapis, Shining Seraph — Havencraft amulet, 3, 5/5. 信仰・先導・光輝.
// While this has at least 4 prayer counters, it's a follower. (CR 5.25; a follower since the start of the turn can
// attack; as an amulet it has no attack or defense to reference and can't be attacked; boxed it is an amulet — rulings.)
// Strike - Search your deck for an Enstatued Seraph, summon it, then shuffle.
// At the start of your main phase, select any number of other cards on your field and place a prayer counter on them
// and this. (Zero others is allowed — ruling.)
import type { TargetSpec } from "../types";
import { atStartOfYourMainPhase, defineCard, strike } from "../helpers";
import { ANY, named } from "../targets";

const otherCards: TargetSpec = {
  candidates: (g, c, self) => g.cards(c, "field").filter((id) => id !== self),
  count: ANY,
  upTo: true,
};

export default defineCard({
  typeWhile: (g, self) => (g.counters(self, "prayer") >= 4 ? "follower" : undefined),
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.search((id) => named("Enstatued Seraph")(fx.game, id), { to: "field" });
      },
    }),
    atStartOfYourMainPhase({
      targets: [otherCards],
      *resolve(fx) {
        for (const id of fx.targets[0] ?? []) if (fx.game.card(id)?.zone === "field") yield* fx.addCounters(id, "prayer", 1);
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, "prayer", 1);
      },
    }),
  ],
});
