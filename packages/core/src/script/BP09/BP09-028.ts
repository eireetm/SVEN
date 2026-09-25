// BP09-028 Queen Magnus the Black — Swordcraft follower, 2, 2/2. 指揮官・童話・キラー.
// While this card is on your field, each Queen Hemera the White on your field has Assail.
// {[act]} {[engage]}: Select up to 2 other {[swordcraft]} followers on your field and give them
// {[attack]}+1. (effect_en says {[defense]}+1; the Japanese, Chinese and official English texts say
// {[attack]}+1 — implemented as those, docs/open-questions.md.)
import { activated, defineCard } from "../helpers";
import { anotherYourFollower, isClass } from "../targets";

export default defineCard({
  field: {
    // Only the card and its name are read (keywordsFor is part of computing information).
    keywordsFor: (g, self, card) => {
      const c = g.card(card);
      return c?.zone === "field" && c.controller === g.card(self)?.controller && g.db.get(c.def).name === "Queen Hemera the White"
        ? ["assail"]
        : [];
    },
  },
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [anotherYourFollower({ count: 2, upTo: true, filter: isClass("Swordcraft") })],
        *resolve(fx) {
          for (const id of fx.targets[0] ?? []) yield* fx.giveStats(id, 1, 0);
        },
      },
    ),
  ],
});
