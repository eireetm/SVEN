// BP04-082 Demonlord Eachtar — Abysscraft follower, 7, 5/6. 死者.
// (BP04-083 and BP04-SP01 are the same card.)
// {[fanfare]}, Necrocharge (10): Select up to 2 Abysscraft followers that cost 2 play points or less
// in your cemetery and put them onto your field. Give each other follower on your field +1/+1.
// NC (20): Give +3/+3 instead.
// The Necrocharge count is fixed when the effect starts to resolve (CR 13.5.1.3.2), before the
// followers leave the cemetery: with exactly 20 cards, both apply (ruling). The followers it puts out get the bonus too; their
// Fanfares resolve afterwards (ruling).
// While this card is on your field, each Abysscraft follower on your field has Rush (itself and a
// stolen one included — rulings).
import { defineCard, fanfare } from "../helpers";
import { inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  field: {
    // No game.info() here: this is part of computing card information.
    keywordsFor: (g, self, card) => {
      const c = g.card(card);
      const s = g.card(self);
      if (!c || !s || c.zone !== "field" || c.controller !== s.controller) return [];
      const def = g.db.get(c.def);
      return def.type === "follower" && def.class === "Abysscraft" ? ["rush"] : [];
    },
  },
  abilities: [
    fanfare({
      targets: [
        inYourZone("cemetery", {
          count: 2,
          upTo: true,
          filter: (g, id) => isFollower(g, id) && isClass("Abysscraft")(g, id) && (g.info(id).cost ?? 99) <= 2,
          when: (g, p) => g.necrocharge(p, 10),
        }),
      ],
      *resolve(fx) {
        if (!fx.game.necrocharge(fx.controller, 10)) return;
        const n = fx.game.necrocharge(fx.controller, 20) ? 3 : 1;
        yield* fx.putOntoField(fx.targets[0] ?? []);
        for (const id of fx.game.followers(fx.controller)) {
          if (id !== fx.self) yield* fx.giveStats(id, n, n);
        }
      },
    }),
  ],
});
