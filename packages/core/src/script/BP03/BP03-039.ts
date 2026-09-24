// BP03-039 Mystic King — Runecraft follower, 6, 5/5. チェス.
// {[evolve]} {[cost02]}: Evolve.
// Activate, bury another Chess follower: Deal 5 to an enemy follower. For the rest of this turn,
// this card's activated abilities except Evolve can't be activated (ruling: only this card;
// the evolved act stays blocked because the effect remains, CR 5.16.2).
import { activated, defineCard, evolveAbility } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
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
          yield* fx.cantActivate(fx.self, true);
        },
      },
    ),
  ],
});
