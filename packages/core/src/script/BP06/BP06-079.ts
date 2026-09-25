// BP06-079 Yuzuki, Righteous Demon — Abysscraft follower, 6, 5/5. 魔界.
// Bane.
// {[fanfare]} Each opponent buries a follower. Necrocharge (10) - They bury 2 instead. (They choose;
// a follower that can't be destroyed by abilities or has Aura is buried too — rulings.)
// {[act]} {[cost03]}, discard this card: Select an enemy follower on the field. Deal it 5 damage and
// bury the top card of your deck. (Valid in the hand — ruling, CR 10.3.5.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        const n = fx.game.necrocharge(fx.controller, 10) ? 2 : 1;
        const followers = fx.game.followers(opponent);
        yield* fx.bury(yield* fx.chooseCards(followers, Math.min(n, followers.length), n, opponent));
      },
    }),
    activated(
      {
        playPoints: 3,
        custom: {
          canPay: (g, _c, self) => g.card(self)?.zone === "hand",
          *pay(fx) {
            yield* fx.discardCards([fx.self]);
          },
        },
      },
      {
        validIn: ["hand"],
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          yield* fx.mill(1);
        },
      },
    ),
  ],
});
