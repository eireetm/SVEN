// BP03-040 Mystic King (Evolved) — Runecraft, 6/6.
// On Evolve: Select up to 4 Chess followers with different names costing 4 or less in your
// cemetery and put them onto your field.
// Activate, bury another Chess follower: Deal 5. This card's activated abilities can't be
// activated for the rest of this turn.
import { activated, defineCard, onEvolve } from "../helpers";
import { enemyFollower, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const used = new Set<string>();
        const picked: import("../../model/ids").CardId[] = [];
        for (let i = 0; i < 4; i++) {
          const opts = fx.game.cards(fx.controller, "cemetery").filter((id) => {
            const info = fx.game.info(id);
            return (
              isFollower(fx.game, id) &&
              hasTrait("チェス")(fx.game, id) &&
              (info.cost ?? 99) <= 4 &&
              !used.has(info.name) &&
              !picked.includes(id)
            );
          });
          if (opts.length === 0) break;
          const [id] = yield* fx.selectCards(opts, 0, 1);
          if (!id) break;
          picked.push(id);
          used.add(fx.game.info(id).name);
        }
        if (picked.length > 0) yield* fx.putOntoField(picked);
      },
    }),
    activated(
      {
        custom: {
          canPay: (g, c, self) => g.followers(c).some((id) => id !== self && hasTrait("チェス")(g, id)),
          *pay(fx) {
            const cards = fx.game.followers(fx.controller).filter((id) => id !== fx.self && hasTrait("チェス")(fx.game, id));
            yield* fx.bury(yield* fx.chooseCards(cards, 1, 1));
          },
        },
      },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          yield* fx.cantActivate(fx.self, false);
        },
      },
    ),
  ],
});
