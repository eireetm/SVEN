// SD01-001 Aria, Fairy Princess — Forestcraft follower, 6, 5/5. 妖精・プリンセス.
// Ward.
// {[fanfare]} Put up to 9 Fairy tokens onto your field or into your EX area. (JA: from among 9 Fairies, put any number onto your
// field and any number into your EX area; 0 is allowed and each zone takes only up to its limit — rulings, CR 4.4.4.2 / 4.8.3.2.)
// While this card is on your field, your other Pixie followers have Rush.
import { defineCard, fanfare } from "../helpers";
import { FAIRY } from "../BP13/shared";

/** "How many?" from 0 to `max`. */
const upTo = (max: number, verb: string) =>
  Array.from({ length: max + 1 }, (_, i) => ({ id: String(i), label: `${verb} ${i}` }));

export default defineCard({
  keywords: ["ward"],
  field: {
    keywordsFor(g, self, card) {
      const c = g.card(card);
      if (card === self || !c || c.zone !== "field" || g.controller(card) !== g.controller(self)) return [];
      const { type, traits } = g.typeAndTraits(card);
      return type === "follower" && traits.includes("妖精") ? ["rush"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        const p = fx.controller;
        const fieldRoom = Math.max(0, fx.game.fieldLimit(p) - fx.game.cards(p, "field").length);
        const [onField] = yield* fx.choose(upTo(Math.min(9, fieldRoom), "Put onto your field:"));
        yield* fx.summon(Array<string>(Number(onField)).fill(FAIRY));
        const exRoom = Math.max(0, fx.game.exAreaLimit(p) - fx.game.cards(p, "ex").length);
        const [intoEx] = yield* fx.choose(upTo(Math.min(9 - Number(onField), exRoom), "Put into your EX area:"));
        yield* fx.tokensToEx(Array<string>(Number(intoEx)).fill(FAIRY));
      },
    }),
  ],
});
