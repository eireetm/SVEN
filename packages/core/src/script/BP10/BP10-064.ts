// BP10-064 Swiftblade Dragonewt — Dragoncraft follower, 3, 3/3. ドラゴニュート・竜族・武装.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there are at least 3 Armed cards in your cemetery, summon a Draconic Weapon token and
// deal 3 damage to each enemy leader.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { threeArmedInCemetery } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: threeArmedInCemetery,
      *resolve(fx) {
        yield* fx.summon(["Draconic Weapon"]);
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
      },
    }),
  ],
});
