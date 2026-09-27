// CP03-083 Phantom Blaster Overlord — Abysscraft follower, 9, 6/6. ヴァンガード・シャドウパラディン.
// If there are at least 15 Shadow Paladin cards in your cemetery, you may bury a Phantom Blaster Dragon to play this card instead
// of paying its cost. (One on your field, as in Japanese 場の; its 9 play points aren't paid — ruling.)
// ----------
// Ward. Twin Drive.
// {[fanfare]} Select an enemy follower on the field. Destroy it and draw 3 cards. (Without an enemy follower nothing happens —
// ruling, CR 10.6.2.3.3.)
// {[act]} {[cost01]}, discard a Phantom Blaster Overlord: Give this follower {[attack]}+6/{[defense]}+6.
import { discardA } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";
import { countIn, shadowPaladin } from "./shared";

const isDragon = named("Phantom Blaster Dragon");

export default defineCard({
  keywords: ["ward", "twinDrive"],
  playOptions: [
    {
      id: "buryDragon",
      label: "Bury a Phantom Blaster Dragon instead of paying the cost",
      setCost: 0,
      freesFieldSlots: 1,
      canPay: (g, p) => countIn(g, p, "cemetery", shadowPaladin) >= 15 && g.followers(p).some((id) => isDragon(g, id)),
      *pay(fx) {
        yield* fx.bury(yield* fx.chooseCards(fx.game.followers(fx.controller).filter((id) => isDragon(fx.game, id)), 1, 1));
      },
    },
  ],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.draw(3);
      },
    }),
    activated(
      { playPoints: 1, custom: discardA(named("Phantom Blaster Overlord")) },
      {
        *resolve(fx) {
          yield* fx.giveStats(fx.self, 6, 6);
        },
      },
    ),
  ],
});
