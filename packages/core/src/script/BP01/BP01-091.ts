// BP01-091 Wyrm Spire — Dragoncraft amulet, 6.
// While this card is on your field, your Dragon tokens have Rush. (Only the "Dragon" token, not
// every Wyrmkin — ruling.)
// {[act]}{[engage]}: Select a follower on the field and destroy it. Its controller summons a
// Dragon token.
import { activated, defineCard } from "../helpers";
import { anyFollower } from "../targets";

export default defineCard({
  field: {
    keywordsFor(g, self, card) {
      const c = g.card(card);
      if (!c || c.controller !== g.card(self)!.controller) return [];
      const def = g.db.get(c.def);
      return def.token && def.name === "Dragon" ? ["rush"] : [];
    },
  },
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [anyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const controller = fx.game.controller(target);
          yield* fx.destroy([target]);
          yield* fx.summon(["Dragon"], { player: controller });
        },
      },
    ),
  ],
});
