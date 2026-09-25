// BP07-104 Viridia Magna — Neutral follower, 4, 0/4. 自然・大神.
// Rush. Assail. Bane.
// {[lastwords]} Banish a Naterran Great Tree from your field or EX area: Put this card onto its
// owner's field engaged and evolve it. If you didn't evolve it, banish it.
// "It" is this card after it moved (CR 4.1.4.1). Rulings: the evolution doesn't count as the turn's
// evolve ability (CR 8.3.2.1); if the Last Words' controller isn't its owner, they can't select from
// the owner's evolve deck, so it can't evolve and is banished (CR 4.6.2).
import { banishFromYour } from "../costs";
import { defineCard, lastWords } from "../helpers";
import { isTree } from "./shared";

export default defineCard({
  keywords: ["rush", "assail", "bane"],
  abilities: [
    lastWords({
      cost: banishFromYour(["field", "ex"], isTree),
      *resolve(fx) {
        const c = fx.game.card(fx.self);
        if (c?.zone !== "cemetery") return;
        const [magna] = yield* fx.putOntoField([fx.self], c.owner, { engaged: true });
        if (magna === undefined) return;
        if (!(yield* fx.evolve(magna))) yield* fx.banish([magna]);
      },
    }),
  ],
});
