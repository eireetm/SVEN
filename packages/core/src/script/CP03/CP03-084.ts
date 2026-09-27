// CP03-084 Phantom Blaster Dragon — Abysscraft follower, 3, 4/3. ヴァンガード・シャドウパラディン.
// As an additional cost to play this card, bury a Shadow Paladin follower. (It can't be played without paying it; put onto the
// field by an ability it needs none — rulings. One on your field, as in Japanese 場の.)
// ----------
// {[evolve]} {[cost01]}: Evolve this follower.
// Storm. Twin Drive.
// {[fanfare]} If you buried a Blaster Dark as the additional cost to play this card, evolve this follower. (That evolution isn't
// the turn's evolve ability — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";
import { followerThat, shadowPaladin } from "./shared";

export default defineCard({
  keywords: ["storm", "twinDrive"],
  playOptionsRequired: true,
  playOptions: [
    {
      id: "bury",
      label: "Bury a Shadow Paladin follower",
      freesFieldSlots: 1,
      canPay: (g, p) => g.followers(p).some((id) => followerThat(shadowPaladin)(g, id)),
      *pay(fx) {
        const g = fx.game;
        const [buried] = yield* fx.chooseCards(g.followers(fx.controller).filter((id) => followerThat(shadowPaladin)(g, id)), 1, 1);
        fx.memory.blasterDark = buried !== undefined && named("Blaster Dark")(g, buried);
        yield* fx.bury(buried === undefined ? [] : [buried]);
      },
    },
  ],
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, _c, self) => g.playedWith(self)?.memory.blasterDark === true,
      *resolve(fx) {
        yield* fx.evolve(fx.self);
      },
    }),
  ],
});
